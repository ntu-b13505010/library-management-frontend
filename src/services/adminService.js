import {
  addBook,
  getAllBooks,
  getAllBorrowRecords,
  getAllUsers,
  getLibraryStatistics,
  reactivateUser,
  removeBook,
  restoreBook,
  suspendUser,
} from '../api/adminApi.js';

// 管理端頁面只呼叫 service，之後串接後端時可保留頁面程式碼。
export function getAdminBorrowRecords(keyword = '') {
  return getAllBorrowRecords(keyword);
}

export function getAdminUsers(keyword = '') {
  return getAllUsers(keyword);
}

export function suspendStudentAccount(userId) {
  return suspendUser(userId);
}

export function reactivateStudentAccount(userId) {
  return reactivateUser(userId);
}

export function getAdminBooks(keyword = '') {
  return getAllBooks(keyword);
}

export function addLibraryBook(bookData) {
  return addBook(bookData);
}

export function removeLibraryBook(bookId) {
  return removeBook(bookId);
}

export function restoreLibraryBook(bookId) {
  return restoreBook(bookId);
}

export function getAdminStatistics() {
  return getLibraryStatistics();
}
