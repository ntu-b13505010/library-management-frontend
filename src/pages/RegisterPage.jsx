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
    <main className="app-shell">
      <PageCard className="auth-card auth-card--register note-card">
        {/* 纸张便签风格，后续可继续扩展注册逻辑 */}
        <aside className="auth-scene note-scene" aria-hidden="true">
          <div className="paper-stack">
            <span>📝</span>
          </div>
          <div className="scene-icons">
            <span>📚</span>
            <span>🪴</span>
          </div>
          <p className="scene-caption">A small card for a new reader.</p>
        </aside>

        <div className="card-content auth-panel">
          <p className="eyebrow">Student Registration</p>
          <h1>Create Student Account</h1>
          <p className="page-intro">Prepare a library card profile for the prototype.</p>

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
        </div>
      </PageCard>
    </main>
  );
}

export default RegisterPage;
