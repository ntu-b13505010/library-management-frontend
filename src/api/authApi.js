import { mockAdmins } from '../mock/mockAdmins.js';
import { mockUsers } from '../mock/mockUsers.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

export function studentLogin(account, password) {
  // 目前只检查前端 mock users。
  const user = mockUsers.find((item) => item.student_no === account && item.password === password);

  if (!user) {
    return fail('Invalid student account or password.', null);
  }

  if (user.status !== 'ACTIVE') {
    return fail('This student account is suspended.', null);
  }

  return ok('Student login successful.', { ...user });
}

export function adminLogin(account, password) {
  // 管理员登录先使用 mock admins，之后可替换成真实 API。
  const admin = mockAdmins.find((item) => item.username === account && item.password === password);

  if (!admin) {
    return fail('Invalid admin account or password.', null);
  }

  return ok('Admin login successful.', { ...admin });
}

export function registerStudent({ student_no, name, password, role_level }) {
  const existingUser = mockUsers.find((item) => item.student_no === student_no);

  if (existingUser) {
    return fail('Student number already exists.', null);
  }

  const newUser = {
    user_id: Math.max(0, ...mockUsers.map((item) => item.user_id)) + 1,
    student_no,
    name,
    password,
    role_level: role_level === 'VIP' ? 'VIP' : 'NORMAL',
    created_at: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
  };

  mockUsers.push(newUser);

  return ok('Student registered successfully.', { ...newUser });
}
