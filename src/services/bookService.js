import { getBookBorrowHistory, getBookDetail, searchBooks } from '../api/bookApi.js';

// 頁面統一呼叫 service，避免直接依賴目前的 mock API 實作。
export function searchLibraryBooks(keyword, searchField) {
  return searchBooks(keyword, searchField);
}

export function getLibraryBookBorrowHistory(bookId) {
  return getBookBorrowHistory(bookId);
}

export function getLibraryBookDetail(bookId) {
  return getBookDetail(bookId);
}
