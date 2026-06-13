import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminReservations } from '../services/reservationService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function ViewReservationsPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadReservations = async (searchKeyword = keyword) => {
    setIsLoading(true);
    const result = await getAdminReservations(searchKeyword);
    setReservations(result.data);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      navigate('/login');
      return;
    }

    setCurrentAdmin(JSON.parse(storedAdmin));
    loadReservations('');
  }, [navigate]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage('');
    await loadReservations(keyword);
  };

  if (!currentAdmin) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin Library</p>
            <h1>View Reservations</h1>
            <p className="page-intro">Review reservation activity across student accounts.</p>
          </div>
          <div className="mini-summary">
            {reservations.filter((reservation) => reservation.status === 'WAITING').length} waiting ·{' '}
            {reservations.length} total
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            aria-label="Search reservations"
            placeholder="Search student no, user, book, or status"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <AppButton type="submit">Search</AppButton>
        </form>

        {message && (
          <p
            className={
              messageType === 'success'
                ? 'form-message form-message--success'
                : 'form-message form-message--error'
            }
          >
            {message}
          </p>
        )}

        {isLoading && <p className="loading-text">Loading...</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Student No</th>
                <th>User Name</th>
                <th>Book ID</th>
                <th>Book Title</th>
                <th>Reserved At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.reservation_id}>
                  <td>{reservation.reservation_id}</td>
                  <td>{reservation.student_no}</td>
                  <td>{reservation.user_name}</td>
                  <td>{reservation.book_id}</td>
                  <td>{reservation.book_title}</td>
                  <td>{reservation.reserved_at}</td>
                  <td>
                    <span className={`status-pill status-pill--${reservation.status.toLowerCase()}`}>
                      {reservation.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && reservations.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">No matching records found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={() => loadReservations(keyword)}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default ViewReservationsPage;
