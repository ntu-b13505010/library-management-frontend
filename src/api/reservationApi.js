import { mockBooks } from '../mock/mockBooks.js';
import { mockBorrowRecords } from '../mock/mockBorrowRecords.js';
import { mockReservations } from '../mock/mockReservations.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const dateToText = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const findBook = (bookId) => mockBooks.find((book) => book.book_id === Number(bookId));
const findUser = (userId) => mockUsers.find((user) => user.user_id === Number(userId));

const hasActiveBorrowRecord = (bookId) =>
  mockBorrowRecords.some(
    (record) =>
      record.book_id === Number(bookId) && ['BORROWING', 'OVERDUE'].includes(record.record_status),
  );

const hasWaitingReservation = (bookId) =>
  mockReservations.some(
    (reservation) => reservation.book_id === Number(bookId) && reservation.status === 'WAITING',
  );

const enrichReservation = (reservation) => {
  const user = findUser(reservation.user_id);
  const book = findBook(reservation.book_id);

  return {
    ...reservation,
    student_no: user?.student_no || '',
    user_name: user?.name || '',
    book_title: book?.title || '',
    book: book ? { ...book } : null,
    user: user ? { ...user } : null,
  };
};

export function reserveBook(userId, bookId) {
  const user = findUser(userId);
  const book = findBook(bookId);

  if (!user || user.status !== 'ACTIVE') {
    return fail('Only active students can reserve books.', null);
  }

  if (!book || book.status === 'REMOVED') {
    return fail('Book does not exist.', null);
  }

  if (book.status === 'RESERVED' || hasWaitingReservation(book.book_id)) {
    return fail('This book is already reserved.', null);
  }

  if (book.status !== 'BORROWED') {
    return fail('Only borrowed books can be reserved.', null);
  }

  const today = dateToText(new Date());
  const newReservation = {
    reservation_id:
      Math.max(0, ...mockReservations.map((reservation) => reservation.reservation_id)) + 1,
    user_id: user.user_id,
    book_id: book.book_id,
    reserved_at: today,
    status: 'WAITING',
    created_at: today,
  };

  // 預約只建立 WAITING 紀錄；書籍仍維持 BORROWED，直到歸還時才轉 RESERVED。
  mockReservations.push(newReservation);

  return ok('Book reserved successfully.', enrichReservation(newReservation));
}

export function getMyReservations(userId) {
  const reservations = mockReservations
    .filter((reservation) => reservation.user_id === Number(userId))
    .map(enrichReservation);

  return ok('Reservations loaded successfully.', reservations);
}

export function cancelReservation(reservationId) {
  const reservation = mockReservations.find(
    (item) => item.reservation_id === Number(reservationId),
  );

  if (!reservation) {
    return fail('Reservation does not exist.', null);
  }

  if (reservation.status !== 'WAITING') {
    return fail('Only waiting reservations can be cancelled.', null);
  }

  reservation.status = 'CANCELLED';

  const book = findBook(reservation.book_id);
  if (book && book.status !== 'REMOVED' && !hasWaitingReservation(book.book_id)) {
    book.status = hasActiveBorrowRecord(book.book_id) ? 'BORROWED' : 'AVAILABLE';
  }

  return ok('Reservation cancelled successfully.', enrichReservation(reservation));
}

export function getAllReservations() {
  return ok(
    'All reservations loaded successfully.',
    mockReservations.map(enrichReservation),
  );
}
