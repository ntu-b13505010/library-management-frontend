import { mockBooks } from '../mock/mockBooks.js';
import { mockBorrowRecords } from '../mock/mockBorrowRecords.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const dateToText = (date) => {
  // 使用本地日期，避免 toISOString() 因時區造成日期提前或延後。
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getBook = (bookId) => mockBooks.find((book) => book.book_id === Number(bookId));
const getUser = (userId) => mockUsers.find((user) => user.user_id === Number(userId));

const enrichRecord = (record) => {
  const book = getBook(record.book_id);
  const user = getUser(record.user_id);

  return {
    ...record,
    book: book ? { ...book } : null,
    user: user ? { ...user } : null,
  };
};

export function borrowBook(userId, bookId) {
  const user = getUser(userId);
  const book = getBook(bookId);

  if (!user || user.status !== 'ACTIVE') {
    return fail('Only active students can borrow books.', null);
  }

  if (!book || book.status === 'REMOVED') {
    return fail('Book does not exist.', null);
  }

  if (book.status !== 'AVAILABLE') {
    return fail('Only available books can be borrowed.', null);
  }

  const borrowDays = user.role_level === 'VIP' ? 14 : 7;
  const today = new Date();
  const borrowDate = dateToText(today);
  const dueDate = dateToText(addDays(today, borrowDays));
  const newRecord = {
    record_id: Math.max(0, ...mockBorrowRecords.map((record) => record.record_id)) + 1,
    user_id: user.user_id,
    book_id: book.book_id,
    borrow_date: borrowDate,
    due_date: dueDate,
    return_date: null,
    borrow_days: borrowDays,
    created_at: borrowDate,
    record_status: 'BORROWING',
  };

  // 借出後同步更新書籍狀態。
  book.status = 'BORROWED';
  mockBorrowRecords.push(newRecord);

  return ok('Book borrowed successfully.', enrichRecord(newRecord));
}

export function returnBook(recordId) {
  const record = mockBorrowRecords.find((item) => item.record_id === Number(recordId));

  if (!record) {
    return fail('Borrow record does not exist.', null);
  }

  if (!['BORROWING', 'OVERDUE'].includes(record.record_status)) {
    return fail('This record cannot be returned.', null);
  }

  const book = getBook(record.book_id);

  record.return_date = dateToText(new Date());
  record.record_status = 'RETURNED';

  if (book && book.status !== 'REMOVED') {
    book.status = 'AVAILABLE';
  }

  return ok('Book returned successfully.', enrichRecord(record));
}

export function getMyBorrowedBooks(userId) {
  const records = mockBorrowRecords
    .filter(
      (record) =>
        record.user_id === Number(userId) && ['BORROWING', 'OVERDUE'].includes(record.record_status),
    )
    .map(enrichRecord);

  return ok('Current borrowed books loaded successfully.', records);
}

export function getBorrowHistory(userId) {
  const records = mockBorrowRecords
    .filter((record) => record.user_id === Number(userId))
    .map(enrichRecord);

  return ok('Borrow history loaded successfully.', records);
}

export function getDueReminders(userId) {
  const today = new Date(dateToText(new Date()));
  const records = mockBorrowRecords
    .filter(
      (record) =>
        record.user_id === Number(userId) && ['BORROWING', 'OVERDUE'].includes(record.record_status),
    )
    .map((record) => {
      const dueDate = new Date(record.due_date);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      let reminder_text = '';

      if (daysUntilDue < 0 || record.record_status === 'OVERDUE') {
        reminder_text = 'Overdue';
      } else if (daysUntilDue === 0) {
        reminder_text = 'Due today';
      } else {
        reminder_text = `Due in ${daysUntilDue} days`;
      }

      return {
        ...enrichRecord(record),
        reminder_text,
        days_until_due: daysUntilDue,
      };
    })
    .filter((record) => record.days_until_due <= 3 || record.reminder_text === 'Overdue');

  return ok('Due reminders loaded successfully.', records);
}
