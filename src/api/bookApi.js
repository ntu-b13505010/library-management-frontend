import httpClient from './httpClient.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const normalizeBook = (book) => ({
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
  status: book.status || 'AVAILABLE',
  has_waiting_reservation: book.has_waiting_reservation ?? book.hasWaitingReservation ?? false,
});

const normalizeBorrowRecord = (record) => ({
  ...record,
  record_id: record.record_id ?? record.recordId,
  student_no: record.student_no ?? record.studentNo ?? '',
  user_name: record.user_name ?? record.userName ?? '',
  book_id: record.book_id ?? record.bookId,
  borrow_date: record.borrow_date ?? record.borrowDate,
  due_date: record.due_date ?? record.dueDate,
  return_date: record.return_date ?? record.returnDate ?? null,
  borrow_days: record.borrow_days ?? record.borrowDays,
  record_status: record.record_status ?? record.recordStatus,
});

const getArrayData = (payload) => (Array.isArray(payload) ? payload : payload?.data || []);

export async function searchBooks(keyword = '', searchField = 'all') {
  try {
    const response = await httpClient.get('/api/books', {
      params: {
        keyword,
        searchField,
      },
    });

    return ok('Books loaded successfully.', getArrayData(response.data).map(normalizeBook));
  } catch (error) {
    return fail(error.response?.data?.message || 'Books request failed.', []);
  }
}

export async function getBookDetail(bookId) {
  try {
    const response = await httpClient.get(`/api/books/${bookId}`);
    const bookData = response.data?.data ?? response.data;

    if (!bookData) {
      return fail('Book does not exist.', null);
    }

    const book = normalizeBook(bookData);

    if (!book || book.status === 'REMOVED') {
      return fail('Book does not exist.', null);
    }

    return ok('Book detail loaded successfully.', book);
  } catch (error) {
    return fail(error.response?.data?.message || 'Book detail request failed.', null);
  }
}

export async function getBookBorrowHistory(bookId) {
  try {
    const response = await httpClient.get(`/api/books/${bookId}/borrow-history`);
    return ok(
      'Book borrow history loaded successfully.',
      getArrayData(response.data).map(normalizeBorrowRecord),
    );
  } catch (error) {
    return fail(error.response?.data?.message || 'Book borrow history request failed.', []);
  }
}
