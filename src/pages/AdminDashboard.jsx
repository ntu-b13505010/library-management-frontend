import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminBooks,
  getAdminBorrowRecords,
  getAdminUsers,
} from '../services/adminService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalBorrowRecords: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      navigate('/login');
      return;
    }

    // 從 localStorage 讀取目前登入管理員。
    setCurrentAdmin(JSON.parse(storedAdmin));

    const loadDashboardStats = async () => {
      setIsLoadingStats(true);
      const [booksResult, usersResult, recordsResult] = await Promise.all([
        getAdminBooks(),
        getAdminUsers(),
        getAdminBorrowRecords(),
      ]);

      setStats({
        totalBooks: booksResult.data.length,
        borrowedBooks: booksResult.data.filter((book) => book.status === 'BORROWED').length,
        activeUsers: usersResult.data.filter((user) => user.status === 'ACTIVE').length,
        suspendedUsers: usersResult.data.filter((user) => user.status === 'SUSPENDED').length,
        totalBorrowRecords: recordsResult.data.length,
      });
      setIsLoadingStats(false);
    };

    // 管理端統計只讀取現有 mock API。
    loadDashboardStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('loginType');
    navigate('/login');
  };

  if (!currentAdmin) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="dashboard-card library-workspace">
        <aside className="dashboard-sidebar admin-sidebar">
          <div className="sidebar-mark" aria-hidden="true">
            📝
          </div>
          <p className="eyebrow">Admin Portal</p>
          <h2>Library Office</h2>
          <p>Simple placeholders for records, readers, and book management.</p>
          <div className="sidebar-decor" aria-hidden="true">
            <span>📚</span>
            <span>💡</span>
          </div>
        </aside>

        <div className="card-content dashboard-main">
          <p className="eyebrow">Library Workspace</p>
          <h1>Welcome, {currentAdmin.username}</h1>
          <p className="page-intro">A calm workspace for managing library records.</p>

          {isLoadingStats ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <div className="stats-grid stats-grid--admin">
              <div className="stat-card">
                <span className="stat-value">{stats.totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.borrowedBooks}</span>
                <span className="stat-label">Borrowed Books</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.activeUsers}</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.suspendedUsers}</span>
                <span className="stat-label">Suspended Users</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalBorrowRecords}</span>
                <span className="stat-label">Total Borrow Records</span>
              </div>
            </div>
          )}

          {/* 管理员功能入口，暂时只显示占位按钮 */}
          <div className="dashboard-actions admin-actions">
            <AppButton onClick={() => navigate('/admin/borrow-records')}>
              View All Borrow Records
            </AppButton>
            <AppButton onClick={() => navigate('/admin/manage-users')}>Manage Users</AppButton>
            <AppButton onClick={() => navigate('/admin/manage-books')}>Manage Books</AppButton>
            <AppButton variant="secondary" onClick={handleLogout}>
              Logout
            </AppButton>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default AdminDashboard;
