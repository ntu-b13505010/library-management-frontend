import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentBorrowedBooks,
  getStudentBorrowHistory,
  getStudentDueReminders,
} from '../services/borrowService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    dueSoon: 0,
    currentlyBorrowed: 0,
    historyCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    // 從 localStorage 讀取目前登入學生。
    const user = JSON.parse(storedUser);
    setCurrentUser(user);

    const loadDashboardStats = async () => {
      setIsLoadingStats(true);
      const [borrowedResult, historyResult, remindersResult] = await Promise.all([
        getCurrentBorrowedBooks(user.user_id),
        getStudentBorrowHistory(user.user_id),
        getStudentDueReminders(user.user_id),
      ]);

      setStats({
        dueSoon: remindersResult.data.length,
        currentlyBorrowed: borrowedResult.data.length,
        historyCount: historyResult.data.length,
      });
      setIsLoadingStats(false);
    };

    // 儀表板統計只讀取現有 mock API。
    loadDashboardStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginType');
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="dashboard-card library-workspace">
        <aside className="dashboard-sidebar app-sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-logo" aria-hidden="true">▰</span>
            <strong>Library<br />Management<br />System</strong>
          </div>
          <nav className="side-menu" aria-label="Student navigation preview">
            <button className="side-menu__item active" type="button">Dashboard</button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/student/search-books')}>
              Search Books
            </button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/student/my-borrowed-books')}>
              My Borrowings
            </button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/student/borrow-history')}>
              Borrow History
            </button>
            <button className="side-menu__item" type="button" onClick={() => navigate('/student/due-reminders')}>
              Due Reminders
            </button>
            <button className="side-menu__item" type="button" onClick={handleLogout}>Logout</button>
          </nav>
        </aside>

        <div className="card-content dashboard-main">
          <header className="dashboard-topbar">
            <div>
              <p className="eyebrow">Student Portal</p>
              <strong>Library Workspace</strong>
            </div>
            <button type="button" onClick={handleLogout}>Logout</button>
          </header>

          <section className="welcome-banner professional-banner">
            <div>
              <h1>
                Welcome back, {currentUser.name}
              </h1>
              <p className="page-intro">Keep reading, keep growing. Role: {currentUser.role_level}</p>
            </div>
            <div className="banner-summary">
              <span>Student No.</span>
              <strong>{currentUser.student_no}</strong>
              <span>Access Level</span>
              <strong>{currentUser.role_level}</strong>
            </div>
          </section>

          {isLoadingStats ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.dueSoon}</span>
                <span className="stat-label">Books Due Soon</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.currentlyBorrowed}</span>
                <span className="stat-label">Currently Borrowed</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.historyCount}</span>
                <span className="stat-label">Borrow History Count</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{currentUser.role_level}</span>
                <span className="stat-label">User Role</span>
              </div>
            </div>
          )}

          <div className="dashboard-panels professional-panels">
            <section className="info-panel">
              <div className="panel-title-row">
                <h2>Due Reminders</h2>
                <button type="button" onClick={() => navigate('/student/due-reminders')}>View all</button>
              </div>
              <p className="panel-main-number">{stats.dueSoon}</p>
              <p className="panel-copy">book(s) need attention soon.</p>
            </section>

            {/* 快速入口仍沿用原本功能。 */}
            <section className="info-panel quick-actions-panel">
              <div className="panel-title-row">
                <h2>Primary Actions</h2>
              </div>
              <div className="dashboard-actions quick-action-grid">
                <AppButton onClick={() => navigate('/student/search-books')}>Search Books</AppButton>
                <AppButton onClick={() => navigate('/student/my-borrowed-books')}>
                  My Borrowings
                </AppButton>
                <AppButton onClick={() => navigate('/student/borrow-history')}>Borrow History</AppButton>
                <AppButton onClick={() => navigate('/student/due-reminders')}>Due Reminders</AppButton>
                <AppButton variant="secondary" onClick={handleLogout}>
                  Logout
                </AppButton>
              </div>
            </section>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default UserDashboard;
