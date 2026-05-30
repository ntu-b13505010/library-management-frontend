import { mockBooks } from '../mock/mockBooks.js';
import { mockBorrowRecords } from '../mock/mockBorrowRecords.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });

export function searchBooks(keyword = '') {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const searchableFields = ['title', 'authors', 'subjects', 'publisher', 'isbn'];

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

  return ok('Books loaded successfully.', books.map((book) => ({ ...book })));
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
