import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentBorrowHistory } from '../services/borrowService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function BorrowHistoryPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async (userId) => {
    setIsLoading(true);
    const result = await getStudentBorrowHistory(userId);
    setRecords(result.data);
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

  if (!currentUser) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Student Library</p>
            <h1>Borrow History</h1>
            <p className="page-intro">Review all mock borrow records for your account.</p>
          </div>
          <div className="mini-summary">{records.length} total record(s)</div>
        </div>

        {isLoading && <p className="loading-text">Loading...</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Book ID</th>
                <th>Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Borrow Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.record_id}</td>
                  <td>{record.book_id}</td>
                  <td>{record.book?.title || ''}</td>
                  <td>{record.borrow_date}</td>
                  <td>{record.due_date}</td>
                  <td>{record.return_date || '-'}</td>
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
                  <td colSpan="8">
                    <div className="empty-state">No borrow history yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={() => loadRecords(currentUser.user_id)}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/student')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default BorrowHistoryPage;
