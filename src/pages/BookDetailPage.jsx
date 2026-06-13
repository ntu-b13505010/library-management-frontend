import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLibraryBookDetail } from '../services/bookService.js';
import { borrowLibraryBook } from '../services/borrowService.js';
import { reserveLibraryBook } from '../services/reservationService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function BookDetailPage() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [book, setBook] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadBook = async () => {
    setIsLoading(true);
    const result = await getLibraryBookDetail(bookId);
    setBook(result.data);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.success ? '' : result.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(storedUser));
    loadBook();
  }, [bookId, navigate]);

  const handleBorrow = async () => {
    const result = await borrowLibraryBook(currentUser.user_id, book.book_id);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadBook();
    }
  };

  const handleReserve = async () => {
    if (book.status === 'RESERVED' || book.has_waiting_reservation) {
      setMessageType('error');
      setMessage('This borrowed book already has a waiting reservation.');
      return;
    }

    if (book.status !== 'BORROWED') {
      setMessageType('error');
      setMessage('Only borrowed books can be reserved.');
      return;
    }

    const result = await reserveLibraryBook(currentUser.user_id, book.book_id);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadBook();
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
            <h1>Book Detail</h1>
            <p className="page-intro">Review catalog metadata before borrowing or reserving.</p>
          </div>
          {book && (
            <div className="mini-summary">
              <span className={`status-pill status-pill--${book.status.toLowerCase()}`}>
                {book.status}
              </span>
            </div>
          )}
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

        {book ? (
          <div className="detail-grid">
            <div className="detail-panel detail-panel--wide">
              <span>Title</span>
              <strong>{book.title}</strong>
            </div>
            <div className="detail-panel">
              <span>Authors</span>
              <strong>{book.authors}</strong>
            </div>
            <div className="detail-panel">
              <span>Subjects</span>
              <strong>{book.subjects}</strong>
            </div>
            <div className="detail-panel">
              <span>Publisher</span>
              <strong>{book.publisher}</strong>
            </div>
            <div className="detail-panel">
              <span>Publish Year</span>
              <strong>{book.publish_year}</strong>
            </div>
            <div className="detail-panel">
              <span>Edition</span>
              <strong>{book.edition}</strong>
            </div>
            <div className="detail-panel">
              <span>Format</span>
              <strong>{book.format_desc}</strong>
            </div>
            <div className="detail-panel">
              <span>Source</span>
              <strong>{book.source}</strong>
            </div>
            <div className="detail-panel">
              <span>ISBN</span>
              <strong>{book.isbn}</strong>
            </div>
            <div className="detail-panel detail-panel--wide">
              <span>Note</span>
              <strong>{book.note || '-'}</strong>
            </div>
          </div>
        ) : (
          !isLoading && <div className="empty-state">Book detail is not available.</div>
        )}

        <div className="page-actions">
          <AppButton onClick={handleBorrow} disabled={!book || book.status !== 'AVAILABLE'}>
            Borrow
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={handleReserve}
            disabled={!book || book.status !== 'BORROWED' || book.has_waiting_reservation}
          >
            Reserve
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/student/search-books')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default BookDetailPage;
