import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStatistics } from '../services/adminService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

const emptyStats = {
  totalBooks: 0,
  borrowedBooks: 0,
  reservedBooks: 0,
  activeUsers: 0,
  suspendedUsers: 0,
  totalBorrowRecords: 0,
  totalReservations: 0,
  popularBooks: [],
  popularSubjects: [],
};

function StatisticsPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [stats, setStats] = useState(emptyStats);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    const result = await getAdminStatistics();
    setStats(result.data || emptyStats);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      navigate('/login');
      return;
    }

    setCurrentAdmin(JSON.parse(storedAdmin));
    loadStats();
  }, [navigate]);

  if (!currentAdmin) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card admin-compact-card admin-statistics-card">
        <div className="section-header admin-compact-header">
          <div>
            <p className="eyebrow">Admin Library</p>
            <h1>Statistics</h1>
            <p className="page-intro">Review mock catalog, user, reservation, and ranking metrics.</p>
          </div>
          <div className="mini-summary">Mock analytics overview</div>
        </div>

        {isLoading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            <div className="stats-grid stats-grid--admin admin-statistics-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.totalBooks}</span>
                <span className="stat-label">Total Books</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.borrowedBooks}</span>
                <span className="stat-label">Borrowed Books</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.reservedBooks}</span>
                <span className="stat-label">Reserved Books</span>
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
                <span className="stat-label">Borrow Records</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalReservations}</span>
                <span className="stat-label">Reservations</span>
              </div>
            </div>

            <div className="dashboard-info-grid admin-ranking-grid">
              <section className="info-panel admin-ranking-panel">
                <div className="panel-title-row">
                  <h2>Popular Books</h2>
                </div>
                <div className="table-wrap compact-table-wrap admin-ranking-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Book</th>
                        <th>Borrows</th>
                        <th>Reservations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.popularBooks.slice(0, 5).map((book, index) => (
                        <tr key={book.book_id}>
                          <td>{index + 1}</td>
                          <td>{book.title}</td>
                          <td>{book.borrow_count}</td>
                          <td>{book.reservation_count}</td>
                        </tr>
                      ))}
                      {stats.popularBooks.length === 0 && (
                        <tr>
                          <td colSpan="4">
                            <div className="empty-state">No popularity data yet.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="info-panel admin-ranking-panel">
                <div className="panel-title-row">
                  <h2>Popular Subjects</h2>
                </div>
                <div className="table-wrap compact-table-wrap admin-ranking-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Subject</th>
                        <th>Books</th>
                        <th>Borrows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.popularSubjects.slice(0, 5).map((subject, index) => (
                        <tr key={subject.subject}>
                          <td>{index + 1}</td>
                          <td>{subject.subject}</td>
                          <td>{subject.book_count}</td>
                          <td>{subject.borrow_count}</td>
                        </tr>
                      ))}
                      {stats.popularSubjects.length === 0 && (
                        <tr>
                          <td colSpan="4">
                            <div className="empty-state">No subject data yet.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}

        <div className="page-actions admin-compact-actions">
          <AppButton onClick={loadStats}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default StatisticsPage;
