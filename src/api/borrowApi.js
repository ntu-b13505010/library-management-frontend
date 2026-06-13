import httpClient from './httpClient.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });
let currentBorrowedRecords = [];

const normalizeBook = (book) =>
  book
    ? {
        book_id: book.book_id ?? book.bookId,
        title: book.title || '',
        authors: book.authors || '',
        subjects: book.subjects || '',
        publisher: book.publisher || '',
        publish_year: book.publish_year ?? book.publishYear ?? '',
        edition: book.edition || '',
        format_desc: book.format_desc ?? book.formatDesc ?? '',
        source: book.source || '',
        isbn: book.isbn || '',
        note: book.note || '',
        status: book.status || '',
      }
    : null;

const normalizeRecord = (record) => {
  const book = normalizeBook(record.book);
  const title = record.title || record.book_title || record.bookTitle || book?.title || '';

  return {
    ...record,
    record_id: record.record_id ?? record.recordId,
    user_id: record.user_id ?? record.userId,
    book_id: record.book_id ?? record.bookId ?? book?.book_id,
    borrow_date: record.borrow_date ?? record.borrowDate,
    due_date: record.due_date ?? record.dueDate,
    return_date: record.return_date ?? record.returnDate ?? null,
    borrow_days: record.borrow_days ?? record.borrowDays,
    created_at: record.created_at ?? record.createdAt,
    record_status: record.record_status ?? record.recordStatus,
    reminder_text: record.reminder_text ?? record.reminderText,
    days_until_due: record.days_until_due ?? record.daysUntilDue,
    title,
    book: book || (title ? { title } : null),
  };
};

const getArrayData = (payload) => (Array.isArray(payload) ? payload : payload?.data || []);

const actionResult = (payload, successMessage, data = null) => {
  if (!payload?.ok) {
    return fail(payload?.message || 'Request failed.', data);
  }

  return ok(payload.message || successMessage, data);
};

const getUserRecords = async (userId, path, message) => {
  try {
    const response = await httpClient.get(`/api/users/${userId}/${path}`);
    const records = getArrayData(response.data).map(normalizeRecord);

    if (path === 'borrowed') {
      currentBorrowedRecords = records;
    }

    return ok(message, records);
  } catch (error) {
    return fail(error.response?.data?.message || `${message} request failed.`, []);
  }
};

export async function borrowBook(userId, bookId) {
  try {
    const response = await httpClient.post('/api/borrow', { userId, bookId });
    return actionResult(response.data, 'Book borrowed successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Borrow request failed.', null);
  }
}

export async function returnBook(recordId) {
  const record = currentBorrowedRecords.find((item) => item.record_id === Number(recordId));

  if (!record?.book_id) {
    return fail('Please refresh borrowed books before returning this record.', null);
  }

  try {
    const response = await httpClient.post('/api/return', {
      recordId,
      bookId: record.book_id,
    });

    return actionResult(response.data, 'Book returned successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Return request failed.', null);
  }
}

export function getMyBorrowedBooks(userId) {
  return getUserRecords(userId, 'borrowed', 'Current borrowed books loaded successfully.');
}

export function getBorrowHistory(userId) {
  return getUserRecords(userId, 'borrow-history', 'Borrow history loaded successfully.');
}

export function getDueReminders(userId) {
  return getUserRecords(userId, 'due-reminders', 'Due reminders loaded successfully.');
}
