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
    <main className="app-shell cozy-corner">
      <PageCard className="auth-card auth-card--login">
        {/* 温暖阅读角落的装饰元素 */}
        <aside className="auth-scene" aria-hidden="true">
          <div className="lamp-shade">💡</div>
          <div className="shelf-line" />
          <div className="scene-icons">
            <span>📚</span>
            <span>🪴</span>
            <span>📝</span>
          </div>
          <p className="scene-caption">Quiet shelves, warm light, simple access.</p>
        </aside>

        <div className="card-content auth-panel">
          <p className="eyebrow">Warm Library Prototype</p>
          <h1>Library Management System</h1>
          <p className="page-intro">A quiet reading corner for students and librarians.</p>

          <div className="role-toggle" aria-label="Login role">
            <button
              className={loginRole === 'student' ? 'role-toggle__item active' : 'role-toggle__item'}
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
              className={loginRole === 'student' ? 'button-row' : 'button-row button-row--single'}
            >
              <AppButton type="submit">Login</AppButton>
              {loginRole === 'student' && (
                // 只有学生登录时显示注册入口。
                <AppButton variant="secondary" onClick={() => navigate('/register')}>
                  Register
                </AppButton>
              )}
            </div>
          </form>

          <div className="test-hints">
            <p className="test-hints__title">Test accounts</p>
            <p>Student: S1001 / 123456, S1002 / 123456</p>
            <p>Suspended student: S1003 / 123456</p>
            <p>Admin: admin / admin123, librarian / library123</p>
          </div>
        </div>
      </PageCard>
    </main>
  );
}

export default LoginPage;
