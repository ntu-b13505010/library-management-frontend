import {
  cancelReservation,
  getAllReservations,
  getMyReservations,
  reserveBook,
} from '../api/reservationApi.js';

// 預約功能透過 service 隔離 mock API，未來可替換為後端請求。
export function reserveLibraryBook(userId, bookId) {
  return reserveBook(userId, bookId);
}

export function getStudentReservations(userId) {
  return getMyReservations(userId);
}

export function cancelStudentReservation(reservationId) {
  return cancelReservation(reservationId);
}

export function getAdminReservations() {
  return getAllReservations();
}
