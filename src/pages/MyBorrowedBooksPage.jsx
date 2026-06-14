import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentBorrowedBooks,
  returnLibraryBook,
} from '../services/borrowService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function MyBorrowedBooksPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async (userId) => {
    setIsLoading(true);
    const result = await getCurrentBorrowedBooks(userId);
    setRecords(result.data);
    setSelectedRecordId(null);
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
    loadRecords(user.user_id);
  }, [navigate]);

  const handleRefresh = () => {
    setMessage('');
    loadRecords(currentUser.user_id);
  };

  const handleReturn = async () => {
    if (!selectedRecordId) {
      setMessageType('error');
      setMessage('Please select a borrow record first.');
      return;
    }

    const result = await returnLibraryBook(selectedRecordId);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadRecords(currentUser.user_id);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card feature-compact-card">
        <div className="section-header feature-compact-header">
          <div>
            <p className="eyebrow">Student Library</p>
            <h1>My Borrowed Books</h1>
            <p className="page-intro">Select an active borrow record to return a book.</p>
          </div>
          <div className="mini-summary">{records.length} active record(s)</div>
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

        <div className="table-wrap feature-compact-table-wrap">
          <table className="data-table feature-compact-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Book ID</th>
                <th>Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Borrow Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  className={selectedRecordId === record.record_id ? 'selected-row' : ''}
                  key={record.record_id}
                  onClick={() => setSelectedRecordId(record.record_id)}
                >
                  <td>{record.record_id}</td>
                  <td>{record.book_id}</td>
                  <td>{record.book?.title || ''}</td>
                  <td>{record.borrow_date}</td>
                  <td>{record.due_date}</td>
                  <td>{record.borrow_days}</td>
                  <td>
                    <span className={`status-pill status-pill--${record.record_status.toLowerCase()}`}>
                      {record.record_status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      No borrowed books right now. Visit Search Books to borrow one.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions feature-compact-actions">
          <AppButton onClick={handleReturn}>Return Selected Book</AppButton>
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

export default MyBorrowedBooksPage;
