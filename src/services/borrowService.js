import {
  borrowBook,
  getBorrowHistory,
  getDueReminders,
  getMyBorrowedBooks,
  returnBook,
} from '../api/borrowApi.js';

// 借閱相關頁面透過 service 存取資料，方便未來改成 Spring Boot API。
export function borrowLibraryBook(userId, bookId) {
  return borrowBook(userId, bookId);
}

export function returnLibraryBook(recordId) {
  return returnBook(recordId);
}

export function getCurrentBorrowedBooks(userId) {
  return getMyBorrowedBooks(userId);
}

export function getStudentBorrowHistory(userId) {
  return getBorrowHistory(userId);
}

export function getStudentDueReminders(userId) {
  return getDueReminders(userId);
}
