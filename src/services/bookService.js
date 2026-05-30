import { getBookBorrowHistory, searchBooks } from '../api/bookApi.js';

// 頁面統一呼叫 service，避免直接依賴目前的 mock API 實作。
export function searchLibraryBooks(keyword) {
  return searchBooks(keyword);
}

export function getLibraryBookBorrowHistory(bookId) {
  return getBookBorrowHistory(bookId);
}
