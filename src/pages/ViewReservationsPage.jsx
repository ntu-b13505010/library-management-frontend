import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminReservations } from '../services/reservationService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function ViewReservationsPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadReservations = async () => {
    setIsLoading(true);
    const result = await getAdminReservations();
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
    loadReservations();
  }, [navigate]);

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
                    <div className="empty-state">No reservations are available yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={loadReservations}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default ViewReservationsPage;
