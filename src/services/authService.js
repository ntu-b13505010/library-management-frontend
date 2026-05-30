import { adminLogin, registerStudent, studentLogin } from '../api/authApi.js';

// Service layer 用來隔離頁面與 mock API，未來改接後端時只需要替換這一層。
export function loginStudent(account, password) {
  return studentLogin(account, password);
}

export function loginAdmin(account, password) {
  return adminLogin(account, password);
}

export function registerStudentAccount(formData) {
  return registerStudent(formData);
}
