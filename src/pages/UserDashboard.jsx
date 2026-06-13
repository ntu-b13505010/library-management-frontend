import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentBorrowedBooks,
  getStudentBorrowHistory,
  getStudentDueReminders,
} from '../services/borrowService.js';
import { getStudentReservations } from '../services/reservationService.js';
import PageCard from '../components/PageCard.jsx';

function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    dueSoon: 0,
    currentlyBorrowed: 0,
    historyCount: 0,
    reservationCount: 0,
  });
  const [dashboardPreview, setDashboardPreview] = useState({
    dueSoon: [],
    borrowedBooks: [],
    recentHistory: [],
    reservations: [],
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
      const [borrowedResult, historyResult, remindersResult, reservationsResult] = await Promise.all([
        getCurrentBorrowedBooks(user.user_id),
        getStudentBorrowHistory(user.user_id),
        getStudentDueReminders(user.user_id),
        getStudentReservations(user.user_id),
      ]);

      setStats({
        dueSoon: remindersResult.data.length,
        currentlyBorrowed: borrowedResult.data.length,
        historyCount: historyResult.data.length,
        reservationCount: reservationsResult.data.filter(
          (reservation) => reservation.status === 'WAITING',
        ).length,
      });
      setDashboardPreview({
        dueSoon: remindersResult.data.slice(0, 3),
        borrowedBooks: borrowedResult.data.slice(0, 3),
        recentHistory: historyResult.data.slice(-3).reverse(),
        reservations: reservationsResult.data.slice(0, 3),
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

  const borrowPeriod = currentUser.role_level === 'VIP' ? 14 : 7;

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="dashboard-card library-workspace student-dashboard">
        <aside className="dashboard-sidebar app-sidebar">
          <div className="sidebar-brand">
            <span className="sidebar-logo" aria-hidden="true" />
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
            <button className="side-menu__item" type="button" onClick={() => navigate('/student/my-reservations')}>
              My Reservations
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
          </header>

          <section className="welcome-banner professional-banner student-dashboard__banner">
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
            <div className="stats-grid student-dashboard__stats">
              <div className="stat-card">
                <span className="stat-value">{stats.dueSoon}</span>
                <span className="stat-label">Due Soon</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.currentlyBorrowed}</span>
                <span className="stat-label">Borrowed</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.historyCount}</span>
                <span className="stat-label">History</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.reservationCount}</span>
                <span className="stat-label">Reservations</span>
              </div>
            </div>
          )}

          <div className="dashboard-info-grid student-dashboard__content">
            <section className="info-panel student-dashboard__panel">
              <div className="panel-title-row">
                <h2>Due Soon Preview</h2>
              </div>
              {dashboardPreview.dueSoon.length > 0 ? (
                <div className="preview-list">
                  {dashboardPreview.dueSoon.map((record) => (
                    <div className="preview-item" key={record.record_id}>
                      <div>
                        <strong>{record.book?.title || record.title || ''}</strong>
                        <span>Due date: {record.due_date}</span>
                      </div>
                      <span className="preview-badge">{record.reminder_text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state compact-empty">No books need attention soon.</p>
              )}
            </section>

            <section className="info-panel student-dashboard__panel">
              <div className="panel-title-row">
                <h2>Current Borrowed Preview</h2>
              </div>
              {dashboardPreview.borrowedBooks.length > 0 ? (
                <div className="preview-list">
                  {dashboardPreview.borrowedBooks.map((record) => (
                    <div className="preview-item" key={record.record_id}>
                      <div>
                        <strong>{record.book?.title || record.title || ''}</strong>
                        <span>Borrowed: {record.borrow_date}</span>
                      </div>
                      <span className="preview-meta">{record.borrow_days} days</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state compact-empty">No books are currently borrowed.</p>
              )}
            </section>

            <section className="info-panel student-dashboard__panel">
              <div className="panel-title-row">
                <h2>Recent Borrow History</h2>
              </div>
              {dashboardPreview.recentHistory.length > 0 ? (
                <div className="preview-list">
                  {dashboardPreview.recentHistory.map((record) => (
                    <div className="preview-item" key={record.record_id}>
                      <div>
                        <strong>{record.book?.title || record.title || ''}</strong>
                        <span>
                          {record.borrow_date} · {record.return_date || 'Not returned'}
                        </span>
                      </div>
                      <span className="preview-badge neutral">{record.record_status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state compact-empty">No borrow history yet.</p>
              )}
            </section>

            <section className="info-panel student-dashboard__panel">
              <div className="panel-title-row">
                <h2>Reservation Summary</h2>
              </div>
              {dashboardPreview.reservations.length > 0 ? (
                <div className="preview-list">
                  {dashboardPreview.reservations.map((reservation) => (
                    <div className="preview-item" key={reservation.reservation_id}>
                      <div>
                        <strong>{reservation.book_title}</strong>
                        <span>Reserved: {reservation.reserved_at}</span>
                      </div>
                      <span className="preview-badge neutral">{reservation.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state compact-empty">No reservations yet.</p>
              )}
            </section>

            <section className="info-panel student-dashboard__panel student-dashboard__account">
              <div className="panel-title-row">
                <h2>Account &amp; Borrowing</h2>
              </div>
              {/* 主內容保留資訊摘要，導覽集中在側邊欄。 */}
              <div className="summary-list">
                <div className="summary-row">
                  <span>Student No.</span>
                  <strong>{currentUser.student_no}</strong>
                </div>
                <div className="summary-row">
                  <span>Name</span>
                  <strong>{currentUser.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Role Level</span>
                  <strong>{currentUser.role_level}</strong>
                </div>
                <div className="summary-row">
                  <span>Borrow Period</span>
                  <strong>{borrowPeriod} days</strong>
                </div>
                <div className="summary-row">
                  <span>Account Status</span>
                  <strong>{currentUser.status}</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default UserDashboard;
