import { mockBooks } from '../mock/mockBooks.js';
import { mockBorrowRecords } from '../mock/mockBorrowRecords.js';
import { mockReservations } from '../mock/mockReservations.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const findUser = (userId) => mockUsers.find((user) => user.user_id === Number(userId));
const findBook = (bookId) => mockBooks.find((book) => book.book_id === Number(bookId));

const enrichBorrowRecord = (record) => {
  const user = findUser(record.user_id);
  const book = findBook(record.book_id);

  return {
    ...record,
    student_no: user?.student_no || '',
    user_name: user?.name || '',
    book_title: book?.title || '',
  };
};

export function getAllBorrowRecords() {
  return ok(
    'All borrow records loaded successfully.',
    mockBorrowRecords.map(enrichBorrowRecord),
  );
}

export function getAllUsers() {
  return ok(
    'All users loaded successfully.',
    mockUsers.map((user) => ({ ...user })),
  );
}

export function suspendUser(userId) {
  const user = findUser(userId);

  if (!user) {
    return fail('User does not exist.', null);
  }

  user.status = 'SUSPENDED';
  return ok('User suspended successfully.', { ...user });
}

export function reactivateUser(userId) {
  const user = findUser(userId);

  if (!user) {
    return fail('User does not exist.', null);
  }

  user.status = 'ACTIVE';
  return ok('User reactivated successfully.', { ...user });
}

export function getAllBooks() {
  return ok(
    'All books loaded successfully.',
    mockBooks.map((book) => ({ ...book })),
  );
}

export function addBook(bookData) {
  const newBook = {
    book_id: Math.max(0, ...mockBooks.map((book) => book.book_id)) + 1,
    title: bookData.title || '',
    authors: bookData.authors || '',
    subjects: bookData.subjects || '',
    publisher: bookData.publisher || '',
    publish_year: bookData.publish_year || '',
    edition: bookData.edition || '',
    format_desc: bookData.format_desc || '',
    source: bookData.source || '',
    isbn: bookData.isbn || '',
    note: bookData.note || '',
    status: 'AVAILABLE',
  };

  // 新增書籍預設可借閱。
  mockBooks.push(newBook);

  return ok('Book added successfully.', { ...newBook });
}

export function removeBook(bookId) {
  const book = findBook(bookId);

  if (!book || book.status === 'REMOVED') {
    return fail('Book does not exist.', null);
  }

  if (['BORROWED', 'RESERVED'].includes(book.status)) {
    return fail('Borrowed or reserved books cannot be removed.', null);
  }

  book.status = 'REMOVED';
  return ok('Book removed successfully.', { ...book });
}

export function getLibraryStatistics() {
  const availableBooks = mockBooks.filter((book) => book.status === 'AVAILABLE').length;
  const borrowedBooks = mockBooks.filter((book) => book.status === 'BORROWED').length;
  const reservedBooks = mockBooks.filter((book) => book.status === 'RESERVED').length;
  const activeUsers = mockUsers.filter((user) => user.status === 'ACTIVE').length;
  const suspendedUsers = mockUsers.filter((user) => user.status === 'SUSPENDED').length;

  const popularBooks = mockBooks
    .map((book) => ({
      book_id: book.book_id,
      title: book.title,
      borrow_count: mockBorrowRecords.filter((record) => record.book_id === book.book_id).length,
      reservation_count: mockReservations.filter(
        (reservation) => reservation.book_id === book.book_id,
      ).length,
    }))
    .map((book) => ({
      ...book,
      popularity_score: book.borrow_count + book.reservation_count,
    }))
    .filter((book) => book.popularity_score > 0)
    .sort((first, second) => second.popularity_score - first.popularity_score);

  const subjectMap = mockBooks.reduce((summary, book) => {
    String(book.subjects || '')
      .split(',')
      .map((subject) => subject.trim())
      .filter(Boolean)
      .forEach((subject) => {
        const current = summary.get(subject) || { subject, book_count: 0, borrow_count: 0 };
        current.book_count += 1;
        current.borrow_count += mockBorrowRecords.filter(
          (record) => record.book_id === book.book_id,
        ).length;
        summary.set(subject, current);
      });

    return summary;
  }, new Map());

  return ok('Library statistics loaded successfully.', {
    totalBooks: mockBooks.length,
    availableBooks,
    borrowedBooks,
    reservedBooks,
    activeUsers,
    suspendedUsers,
    totalBorrowRecords: mockBorrowRecords.length,
    totalReservations: mockReservations.length,
    popularBooks,
    popularSubjects: Array.from(subjectMap.values()).sort(
      (first, second) => second.borrow_count - first.borrow_count || second.book_count - first.book_count,
    ),
  });
}
