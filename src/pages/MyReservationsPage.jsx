import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  cancelStudentReservation,
  getStudentReservations,
} from '../services/reservationService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function MyReservationsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadReservations = async (userId) => {
    setIsLoading(true);
    const result = await getStudentReservations(userId);
    setReservations(result.data);
    setSelectedReservationId(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setCurrentUser(user);
    loadReservations(user.user_id);
  }, [navigate]);

  const handleRefresh = () => {
    setMessage('');
    loadReservations(currentUser.user_id);
  };

  const handleCancel = async () => {
    if (!selectedReservationId) {
      setMessageType('error');
      setMessage('Please select a reservation first.');
      return;
    }

    const result = await cancelStudentReservation(selectedReservationId);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadReservations(currentUser.user_id);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Student Library</p>
            <h1>My Reservations</h1>
            <p className="page-intro">Track waiting, fulfilled, and cancelled reservations.</p>
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
                <th>Book ID</th>
                <th>Title</th>
                <th>Reserved At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  className={
                    selectedReservationId === reservation.reservation_id ? 'selected-row' : ''
                  }
                  key={reservation.reservation_id}
                  onClick={() => setSelectedReservationId(reservation.reservation_id)}
                >
                  <td>{reservation.reservation_id}</td>
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
                  <td colSpan="5">
                    <div className="empty-state">No reservations yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={handleCancel}>Cancel Reservation</AppButton>
          <AppButton variant="secondary" onClick={handleRefresh}>
            Refresh
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/student')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default MyReservationsPage;
