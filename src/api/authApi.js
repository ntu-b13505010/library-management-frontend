import httpClient from './httpClient.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const normalizeStudent = (user) => ({
  user_id: user.user_id ?? user.userId,
  student_no: user.student_no ?? user.studentNo,
  name: user.name,
  role_level: user.role_level ?? user.roleLevel,
  status: user.status,
});

const normalizeAdmin = (admin) => ({
  admin_id: admin.admin_id ?? admin.adminId,
  username: admin.username,
});

export async function studentLogin(account, password) {
  try {
    const response = await httpClient.post('/api/auth/login', {
      studentNo: account,
      password,
    });
    const payload = response.data;

    if (!payload?.ok) {
      return fail(payload?.message || 'Invalid student account or password.', null);
    }

    const user = normalizeStudent(payload);

    if (user.status !== 'ACTIVE') {
      return fail('This student account is suspended.', null);
    }

    return ok('Student login successful.', user);
  } catch (error) {
    return fail(error.response?.data?.message || 'Student login request failed.', null);
  }
}

export async function adminLogin(account, password) {
  try {
    const response = await httpClient.post('/api/auth/admin-login', {
      username: account,
      password,
    });
    const payload = response.data;

    if (!payload?.ok) {
      return fail(payload?.message || 'Invalid admin account or password.', null);
    }

    return ok('Admin login successful.', normalizeAdmin(payload));
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin login request failed.', null);
  }
}

export async function registerStudent({ student_no, name, password, role_level }) {
  try {
    const response = await httpClient.post('/api/auth/register', {
      studentNo: student_no,
      name,
      password,
      roleLevel: role_level,
    });
    const payload = response.data;

    if (!payload?.ok) {
      return fail(payload?.message || 'Register failed.', null);
    }

    return ok(payload.message || 'Register successful.', payload);
  } catch (error) {
    return fail(error.response?.data?.message || 'Register request failed.', null);
  }
}
