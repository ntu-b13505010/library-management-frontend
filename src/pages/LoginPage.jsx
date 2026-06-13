import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, loginStudent } from '../services/authService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function LoginPage() {
  const [loginRole, setLoginRole] = useState('student');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setMessage('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    // 仍然只呼叫前端 mock API，沒有連接後端。
    const result =
      loginRole === 'admin'
        ? await loginAdmin(account.trim(), password)
        : await loginStudent(account.trim(), password);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    if (loginRole === 'admin') {
      localStorage.setItem('currentAdmin', JSON.stringify(result.data));
      localStorage.setItem('loginType', 'admin');
      navigate('/admin');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(result.data));
    localStorage.setItem('loginType', 'student');
    navigate('/student');
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
              <p className="eyebrow">University Library Access</p>
              <h1>Library Management System</h1>
              <p>
                Frontend mock portal for catalog access, circulation records, due reminders,
                and librarian administration workflows.
              </p>
            </div>

            <div className="system-status-panel">
              <div className="status-row">
                <span>Environment</span>
                <strong>Frontend Mock Demo</strong>
              </div>
              <div className="status-row">
                <span>Access Roles</span>
                <strong>Student · Administrator</strong>
              </div>
              <div className="status-row">
                <span>Integration</span>
                <strong>Service layer ready</strong>
              </div>
            </div>

            <div className="module-list">
              <p>Available modules</p>
              <ul>
                <li>Student catalog search and borrowing workflow</li>
                <li>Borrow history and due reminder tracking</li>
                <li>Administrative user, book, and record management</li>
              </ul>
            </div>
          </section>

          <PageCard className="portal-login-card">
            <div className="card-content auth-panel">
              <p className="eyebrow">Secure Mock Login</p>
              <h2>Sign in to continue</h2>

              <div className="role-toggle" aria-label="Login role">
                <button
                  className={
                    loginRole === 'student' ? 'role-toggle__item active' : 'role-toggle__item'
                  }
                  type="button"
                  onClick={() => handleRoleChange('student')}
                >
                  Student
                </button>
                <button
                  className={loginRole === 'admin' ? 'role-toggle__item active' : 'role-toggle__item'}
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                >
                  Admin
                </button>
              </div>

              <form className="form-stack" onSubmit={handleLogin}>
                <label>
                  Account
                  <input
                    type="text"
                    name="account"
                    placeholder="Enter account"
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                {message && <p className="form-message form-message--error">{message}</p>}

                <div
                  className={
                    loginRole === 'student' ? 'button-row' : 'button-row button-row--single'
                  }
                >
                  <AppButton type="submit">Login</AppButton>
                  {loginRole === 'student' && (
                    // 只有學生登入時顯示註冊入口。
                    <AppButton variant="secondary" onClick={() => navigate('/register')}>
                      Register
                    </AppButton>
                  )}
                </div>
              </form>

            </div>
          </PageCard>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
