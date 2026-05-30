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
        <aside className="dashboard-sidebar app-sidebar admin-sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-logo" aria-hidden="true">▰</span>
            <strong>Library<br />Management<br />System</strong>
          </div>
          <nav className="side-menu" aria-label="Admin navigation preview">
            <button className="side-menu__item active" type="button">Dashboard</button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/admin/borrow-records')}>
              Borrow Records
            </button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/admin/manage-users')}>
              Manage Users
            </button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/admin/manage-books')}>
              Manage Books
            </button>
            <button className="side-menu__item" type="button" onClick={handleLogout}>Logout</button>
          </nav>
        </aside>

        <div className="card-content dashboard-main">
          <header className="dashboard-topbar admin-topbar">
            <div>
              <p className="eyebrow">Admin Portal</p>
              <strong>Librarian Control Center</strong>
            </div>
            <button type="button" onClick={handleLogout}>Logout</button>
          </header>

          <section className="welcome-banner admin-banner professional-banner">
            <div>
              <h1>Welcome, {currentAdmin.username}</h1>
              <p className="page-intro">A calm workspace for records, readers, and books.</p>
            </div>
            <div className="banner-summary admin-summary">
              <span>Mode</span>
              <strong>Administration</strong>
              <span>Session</span>
              <strong>Mock API</strong>
            </div>
          </section>

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

          <section className="info-panel quick-actions-panel">
            <div className="panel-title-row">
              <h2>Control Desk</h2>
            </div>
            {/* 管理員功能入口，仍沿用既有路由。 */}
            <div className="dashboard-actions admin-actions quick-action-grid">
              <AppButton onClick={() => navigate('/admin/borrow-records')}>
                View Borrow Records
              </AppButton>
              <AppButton onClick={() => navigate('/admin/manage-users')}>Manage Users</AppButton>
              <AppButton onClick={() => navigate('/admin/manage-books')}>Manage Books</AppButton>
              <AppButton variant="secondary" onClick={handleLogout}>
                Logout
              </AppButton>
            </div>
          </section>
        </div>
      </PageCard>
    </main>
  );
}

export default AdminDashboard;
