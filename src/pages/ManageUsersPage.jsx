import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminUsers,
  reactivateStudentAccount,
  suspendStudentAccount,
} from '../services/adminService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function ManageUsersPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async (searchKeyword = keyword) => {
    setIsLoading(true);
    const result = await getAdminUsers(searchKeyword);
    setUsers(result.data);
    setSelectedUserId((currentId) =>
      result.data.some((user) => user.user_id === currentId) ? currentId : null,
    );
    setIsLoading(false);
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      navigate('/login');
      return;
    }

    setCurrentAdmin(JSON.parse(storedAdmin));
    loadUsers('');
  }, [navigate]);

  const selectedUser = users.find((user) => user.user_id === selectedUserId);
  const activeCount = users.filter((user) => user.status === 'ACTIVE').length;
  const suspendedCount = users.filter((user) => user.status === 'SUSPENDED').length;

  const handleRefresh = () => {
    setMessage('');
    loadUsers(keyword);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage('');
    await loadUsers(keyword);
  };

  const handleSuspend = async () => {
    if (!selectedUser) {
      setMessageType('error');
      setMessage('Please select a user first.');
      return;
    }

    if (selectedUser.status === 'SUSPENDED') {
      setMessageType('error');
      setMessage('This user is already suspended.');
      return;
    }

    const result = await suspendStudentAccount(selectedUser.user_id);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadUsers();
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) {
      setMessageType('error');
      setMessage('Please select a user first.');
      return;
    }

    if (selectedUser.status === 'ACTIVE') {
      setMessageType('error');
      setMessage('This user is already active.');
      return;
    }

    const result = await reactivateStudentAccount(selectedUser.user_id);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadUsers();
    }
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
            <h1>Manage Users</h1>
            <p className="page-intro">Select a reader account to suspend or reactivate it.</p>
          </div>
          <div className="mini-summary">
            {activeCount} active · {suspendedCount} suspended
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search student no, name, role level, or status"
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
                <th>User ID</th>
                <th>Student No</th>
                <th>Name</th>
                <th>Role Level</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  className={selectedUserId === user.user_id ? 'selected-row' : ''}
                  key={user.user_id}
                  onClick={() => setSelectedUserId(user.user_id)}
                >
                  <td>{user.user_id}</td>
                  <td>{user.student_no}</td>
                  <td>{user.name}</td>
                  <td>{user.role_level}</td>
                  <td>
                    <span className={`status-pill status-pill--${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.created_at}</td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">No matching records found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton variant="secondary" onClick={handleRefresh}>
            Refresh
          </AppButton>
          <AppButton onClick={handleSuspend}>Suspend Selected User</AppButton>
          <AppButton onClick={handleReactivate}>Reactivate Selected User</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default ManageUsersPage;
