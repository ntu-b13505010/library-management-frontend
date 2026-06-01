import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminBooks,
  getAdminBorrowRecords,
  getAdminUsers,
} from '../services/adminService.js';
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
  const [dashboardPreview, setDashboardPreview] = useState({
    recentRecords: [],
    users: [],
    books: [],
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

      const books = booksResult.data;
      const users = usersResult.data;
      const records = recordsResult.data;

      setStats({
        totalBooks: books.length,
        borrowedBooks: books.filter((book) => book.status === 'BORROWED').length,
        activeUsers: users.filter((user) => user.status === 'ACTIVE').length,
        suspendedUsers: users.filter((user) => user.status === 'SUSPENDED').length,
        totalBorrowRecords: recordsResult.data.length,
      });
      setDashboardPreview({
        recentRecords: records.slice(-4).reverse(),
        users,
        books,
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

          <div className="dashboard-info-grid admin-info-grid">
            <section className="info-panel">
              <div className="panel-title-row">
                <h2>Recent Borrow Records</h2>
              </div>
              {dashboardPreview.recentRecords.length > 0 ? (
                <div className="preview-list">
                  {dashboardPreview.recentRecords.map((record) => (
                    <div className="preview-item" key={record.record_id}>
                      <div>
                        <strong>{record.book_title}</strong>
                        <span>
                          {record.student_no} · Due {record.due_date}
                        </span>
                      </div>
                      <span className="preview-badge neutral">{record.record_status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state compact-empty">No borrow records are available.</p>
              )}
            </section>

            <section className="info-panel">
              <div className="panel-title-row">
                <h2>User Status Summary</h2>
              </div>
              <div className="summary-list">
                <div className="summary-row">
                  <span>Active Users</span>
                  <strong>{stats.activeUsers}</strong>
                </div>
                <div className="summary-row">
                  <span>Suspended Users</span>
                  <strong>{stats.suspendedUsers}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Users</span>
                  <strong>{dashboardPreview.users.length}</strong>
                </div>
              </div>
            </section>

            <section className="info-panel">
              <div className="panel-title-row">
                <h2>Book Status Summary</h2>
              </div>
              <div className="summary-list">
                <div className="summary-row">
                  <span>Available Books</span>
                  <strong>
                    {dashboardPreview.books.filter((book) => book.status === 'AVAILABLE').length}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Borrowed Books</span>
                  <strong>{stats.borrowedBooks}</strong>
                </div>
                <div className="summary-row">
                  <span>Removed Books</span>
                  <strong>
                    {dashboardPreview.books.filter((book) => book.status === 'REMOVED').length}
                  </strong>
                </div>
              </div>
            </section>

            <section className="info-panel">
              <div className="panel-title-row">
                <h2>Admin System Overview</h2>
              </div>
              {/* 主內容呈現營運概覽，功能導覽集中於側邊欄。 */}
              <div className="summary-list">
                <div className="summary-row">
                  <span>Signed In As</span>
                  <strong>{currentAdmin.username}</strong>
                </div>
                <div className="summary-row">
                  <span>Data Source</span>
                  <strong>Mock API</strong>
                </div>
                <div className="summary-row">
                  <span>Management Scope</span>
                  <strong>Users · Books · Records</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default AdminDashboard;
