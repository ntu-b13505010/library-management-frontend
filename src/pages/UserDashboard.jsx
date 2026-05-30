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
        <aside className="dashboard-sidebar">
          <div className="sidebar-mark" aria-hidden="true">
            📚
          </div>
          <p className="eyebrow">Student Portal</p>
          <h2>Reading Desk</h2>
          <p>Warm shelves for searching, borrowing notes, and reminders.</p>
          <div className="sidebar-decor" aria-hidden="true">
            <span>💡</span>
            <span>🪴</span>
          </div>
        </aside>

        <div className="card-content dashboard-main">
          <p className="eyebrow">Library Workspace</p>
          <h1>
            Welcome, {currentUser.name} ({currentUser.role_level})
          </h1>
          <p className="page-intro">Choose a library task from your reading desk.</p>

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

          {/* 后续功能页面会从这些入口继续扩展 */}
          <div className="dashboard-actions">
            <AppButton onClick={() => navigate('/student/search-books')}>Search Books</AppButton>
            <AppButton onClick={() => navigate('/student/my-borrowed-books')}>
              My Borrowed Books
            </AppButton>
            <AppButton onClick={() => navigate('/student/borrow-history')}>Borrow History</AppButton>
            <AppButton onClick={() => navigate('/student/due-reminders')}>Due Reminders</AppButton>
            <AppButton variant="secondary" onClick={handleLogout}>
              Logout
            </AppButton>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default UserDashboard;
