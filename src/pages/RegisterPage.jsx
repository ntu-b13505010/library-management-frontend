import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudentAccount } from '../services/authService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_no: '',
    name: '',
    password: '',
    role_level: 'NORMAL',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setMessage('');
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const payload = {
      student_no: formData.student_no.trim(),
      name: formData.name.trim(),
      password: formData.password,
      role_level: formData.role_level,
    };

    // 基本前端驗證，暫不連接後端。
    if (!payload.student_no || !payload.name || !payload.password) {
      setMessageType('error');
      setMessage('Student No, Name, and Password are required.');
      return;
    }

    const result = await registerStudentAccount(payload);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      setTimeout(() => {
        navigate('/login');
      }, 900);
    }
  };

  return (
    <main className="portal-shell">
      <section className="portal-frame">
        <header className="portal-header">
          <div className="portal-brand">
            <span className="brand-icon" aria-hidden="true" />
            <div>
              <strong>University Library Portal</strong>
              <span>Library Management System</span>
            </div>
          </div>
          <p>Frontend mock demo · Service-ready architecture</p>
        </header>

        <div className="portal-layout portal-layout--professional">
          <section className="portal-hero portal-hero--system">
            <div className="portal-hero-content">
              <p className="eyebrow">Student Library Access</p>
              <h1>Create your library account</h1>
              <p>
                Register a student profile to search the university catalog, manage borrowing,
                and keep track of reservations and due dates.
              </p>
            </div>

            <div className="system-status-panel">
              <div className="status-row">
                <span>Account Type</span>
                <strong>Student Reader</strong>
              </div>
              <div className="status-row">
                <span>Membership</span>
                <strong>Normal or VIP</strong>
              </div>
              <div className="status-row">
                <span>Access</span>
                <strong>Library services portal</strong>
              </div>
            </div>

            <div className="module-list">
              <p>Student account features</p>
              <ul>
                <li>Search and review the university library catalog</li>
                <li>Track borrowed books, history, and due reminders</li>
                <li>Manage personal book reservations</li>
              </ul>
            </div>
          </section>

          <PageCard className="portal-login-card">
            <div className="card-content auth-panel">
              <p className="eyebrow">Student Registration</p>
              <h2>Create Student Account</h2>
              <p className="page-intro">Set up your university library portal access.</p>

              <form className="form-stack" onSubmit={handleRegister}>
                <label>
                  Student No
                  <input
                    type="text"
                    name="student_no"
                    placeholder="Enter student number"
                    value={formData.student_no}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Role Level
                  <select name="role_level" value={formData.role_level} onChange={handleInputChange}>
                    <option value="NORMAL">NORMAL</option>
                    <option value="VIP">VIP</option>
                  </select>
                </label>

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

                <div className="button-row">
                  <AppButton type="submit">Register</AppButton>
                  <AppButton variant="secondary" onClick={() => navigate('/login')}>
                    Back to Login
                  </AppButton>
                </div>
              </form>

              <p className="ui-version">UI version: warm-library-v2</p>
            </div>
          </PageCard>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
