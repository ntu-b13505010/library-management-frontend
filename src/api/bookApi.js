import { mockBooks } from '../mock/mockBooks.js';
import { mockBorrowRecords } from '../mock/mockBorrowRecords.js';
import { mockReservations } from '../mock/mockReservations.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const withReservationState = (book) => ({
  ...book,
  has_waiting_reservation: mockReservations.some(
    (reservation) => reservation.book_id === book.book_id && reservation.status === 'WAITING',
  ),
});

export function searchBooks(keyword = '', searchField = 'all') {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const fieldMap = {
    title: ['title'],
    author: ['authors'],
    subject: ['subjects'],
    publisher: ['publisher'],
    isbn: ['isbn'],
    all: ['title', 'authors', 'subjects', 'publisher', 'isbn'],
  };
  const searchableFields = fieldMap[searchField] || fieldMap.all;

  // REMOVED 書籍不顯示在一般搜尋結果中。
  const books = mockBooks.filter((book) => {
    if (book.status === 'REMOVED') {
      return false;
    }

    if (!normalizedKeyword) {
      return true;
    }

    return searchableFields.some((field) =>
      String(book[field] || '')
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  });

  return ok('Books loaded successfully.', books.map(withReservationState));
}

export function getBookDetail(bookId) {
  const book = mockBooks.find((item) => item.book_id === Number(bookId));

  if (!book || book.status === 'REMOVED') {
    return fail('Book does not exist.', null);
  }

  return ok('Book detail loaded successfully.', withReservationState(book));
}

export function getBookBorrowHistory(bookId) {
  const selectedBookId = Number(bookId);
  const records = mockBorrowRecords
    .filter((record) => record.book_id === selectedBookId)
    .map((record) => {
      const user = mockUsers.find((item) => item.user_id === record.user_id);

      return {
        ...record,
        student_no: user?.student_no || '',
        user_name: user?.name || '',
      };
    });

  return ok('Book borrow history loaded successfully.', records);
}
