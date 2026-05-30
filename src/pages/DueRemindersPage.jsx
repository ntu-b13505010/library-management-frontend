import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentDueReminders } from '../services/borrowService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function DueRemindersPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async (userId) => {
    setIsLoading(true);
    const result = await getStudentDueReminders(userId);
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
            <h1>Due Reminders</h1>
            <p className="page-intro">Books due within three days or already overdue.</p>
          </div>
          <div className="mini-summary">{records.length} reminder(s)</div>
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
                <th>Borrow Days</th>
                <th>Status</th>
                <th>Reminder</th>
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
                  <td>{record.borrow_days}</td>
                  <td>
                    <span className={`status-pill status-pill--${record.record_status.toLowerCase()}`}>
                      {record.record_status}
                    </span>
                  </td>
                  <td>{record.reminder_text}</td>
                </tr>
              ))}
              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">Nothing urgent. No books are due soon.</div>
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

export default DueRemindersPage;
