import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLibraryBookBorrowHistory } from '../services/bookService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function BookBorrowHistoryPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecords = async () => {
    setIsLoading(true);
    const result = await getLibraryBookBorrowHistory(bookId);
    setRecords(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    // 依照路由參數查詢指定書籍借閱紀錄。
    loadRecords();
  }, [bookId, navigate]);

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Student Library</p>
            <h1>Book Borrow History</h1>
            <p className="page-intro">Borrow records for selected book ID: {bookId}</p>
          </div>
          <div className="mini-summary">{records.length} record(s)</div>
        </div>

        {isLoading && <p className="loading-text">Loading...</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Student No</th>
                <th>User Name</th>
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
                    <div className="empty-state">No borrow records for this book yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={loadRecords}>Refresh</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/student/search-books')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default BookBorrowHistoryPage;
