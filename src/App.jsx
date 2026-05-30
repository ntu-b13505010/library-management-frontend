import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SearchBooksPage from './pages/SearchBooksPage.jsx';
import MyBorrowedBooksPage from './pages/MyBorrowedBooksPage.jsx';
import BorrowHistoryPage from './pages/BorrowHistoryPage.jsx';
import DueRemindersPage from './pages/DueRemindersPage.jsx';
import BookBorrowHistoryPage from './pages/BookBorrowHistoryPage.jsx';
import AllBorrowRecordsPage from './pages/AllBorrowRecordsPage.jsx';
import ManageUsersPage from './pages/ManageUsersPage.jsx';
import ManageBooksPage from './pages/ManageBooksPage.jsx';

function App() {
  return (
    <Routes>
      {/* 默认进入登录页面 */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/student" element={<UserDashboard />} />
      <Route path="/student/search-books" element={<SearchBooksPage />} />
      <Route path="/student/my-borrowed-books" element={<MyBorrowedBooksPage />} />
      <Route path="/student/borrow-history" element={<BorrowHistoryPage />} />
      <Route path="/student/due-reminders" element={<DueRemindersPage />} />
      <Route path="/student/book-borrow-history/:bookId" element={<BookBorrowHistoryPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/borrow-records" element={<AllBorrowRecordsPage />} />
      <Route path="/admin/manage-users" element={<ManageUsersPage />} />
      <Route path="/admin/manage-books" element={<ManageBooksPage />} />
    </Routes>
  );
}

export default App;
