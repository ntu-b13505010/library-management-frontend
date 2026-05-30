import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminBorrowRecords } from '../services/adminService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function AllBorrowRecordsPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async () => {
    setIsLoading(true);
    const result = await getAdminBorrowRecords();
    setRecords(result.data);
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

    // 管理員頁面需要登入後才能使用。
    setCurrentAdmin(JSON.parse(storedAdmin));
    loadRecords();
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
            <h1>All Borrow Records</h1>
            <p className="page-intro">Review all student borrow records from the mock data.</p>
          </div>
          <div className="mini-summary">{records.length} total record(s)</div>
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
                <th>Record ID</th>
                <th>Student No</th>
                <th>User Name</th>
                <th>Book ID</th>
                <th>Book Title</th>
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
                  <td>{record.student_no}</td>
                  <td>{record.user_name}</td>
                  <td>{record.book_id}</td>
                  <td>{record.book_title}</td>
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
                  <td colSpan="10">
                    <div className="empty-state">No borrow records are available yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={loadRecords}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default AllBorrowRecordsPage;
