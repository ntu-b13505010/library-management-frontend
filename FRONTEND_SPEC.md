# Library Management System Frontend Specification

## 1. Project Role

This project is currently a Java Swing + JDBC + MySQL Library Management System.

This frontend project is only a Web frontend prototype.

Important rules:

- Do not modify the Java Swing application.
- Do not modify backend code.
- Do not modify JDBC code.
- Do not connect directly to MySQL.
- Do not assume real Web APIs already exist.
- Use mock data and mock API functions first.
- Keep the structure ready for future API integration.

The goal is to build a React frontend prototype that can later connect to a real backend API.

---

## 2. Recommended Tech Stack

Use:

- React
- Vite
- React Router
- Axios
- CSS modules or normal CSS

Do not use a heavy UI framework unless explicitly asked.

---

## 3. Expected Folder Structure

```txt
src/
  api/
    authApi.js
    bookApi.js
    borrowApi.js
    adminApi.js

  mock/
    mockUsers.js
    mockAdmins.js
    mockBooks.js
    mockBorrowRecords.js

  pages/
    LoginPage.jsx
    RegisterPage.jsx
    UserDashboard.jsx
    SearchBooksPage.jsx
    MyBorrowedBooksPage.jsx
    BorrowHistoryPage.jsx
    DueRemindersPage.jsx
    BookBorrowHistoryPage.jsx
    AdminDashboard.jsx
    AllBorrowRecordsPage.jsx
    ManageUsersPage.jsx
    ManageBooksPage.jsx

  components/
    AppButton.jsx
    DataTable.jsx
    PageCard.jsx
    Navbar.jsx

  styles/
    global.css

  App.jsx
  main.jsx
```

---

## 4. Current System Features

### Student Features

- Student Login
- Student Register
- User Dashboard
- Search Books
- Borrow Book
- My Borrowed Books
- Return Book
- Borrow History
- Due Reminders
- Book Borrow History
- NORMAL / VIP borrow day difference

### Admin Features

- Admin Login
- Admin Dashboard
- View All Borrow Records
- Manage Users
- Suspend User
- Reactivate User
- Manage Books
- View All Books
- Add Book
- Remove Book

---

## 5. Page Flow

### Student Flow

```txt
Login
 ├─ Register
 └─ User Dashboard
      ├─ Search Books
      │    └─ View Book Borrow History
      ├─ My Borrowed Books
      ├─ Borrow History
      ├─ Due Reminders
      └─ Logout -> Login
```

### Admin Flow

```txt
Login
 └─ Admin Dashboard
      ├─ View All Borrow Records
      ├─ Manage Users
      ├─ Manage Books
      └─ Logout -> Login
```

---

## 6. Mock Database Fields

### users

```txt
user_id
student_no
name
password
role_level
created_at
status
```

### admins

```txt
admin_id
username
password
created_at
```

### books

```txt
book_id
title
authors
subjects
publisher
publish_year
edition
format_desc
source
isbn
note
status
```

### borrow_records

```txt
record_id
user_id
book_id
borrow_date
due_date
return_date
borrow_days
created_at
record_status
```

---

## 7. Status Values

### users.role_level

```txt
NORMAL
VIP
```

### users.status

```txt
ACTIVE
SUSPENDED
```

### books.status

```txt
AVAILABLE
BORROWED
REMOVED
```

### borrow_records.record_status

```txt
BORROWING
RETURNED
OVERDUE
```

---

## 8. Business Rules

### Login

- Student login checks mock users.
- Student account can login only when `status = ACTIVE`.
- Admin login checks mock admins.
- Student and Admin should enter different dashboards after login.

### Register

- Only students can register.
- Register creates a new mock user.
- Role level can be `NORMAL` or `VIP`.
- New account default status is `ACTIVE`.

### Borrow Book

- Only books with `status = AVAILABLE` can be borrowed.
- After borrowing:
  - `books.status` becomes `BORROWED`.
  - A new `borrow_records` item is created.
- Borrow days:
  - `NORMAL` = 7 days
  - `VIP` = 14 days

### Return Book

- Only unreturned records can be returned.
- After returning:
  - `return_date = today`
  - `record_status = RETURNED`
  - `books.status = AVAILABLE`

### Due Reminders

Show current user's unreturned books when:

- Due within 3 days, or
- Already overdue.

Reminder text examples:

```txt
Due today
Due in 1 day
Due in X days
Overdue
```

### Admin - Manage Users

Admin can change user status to:

```txt
SUSPENDED
ACTIVE
```

Suspended users cannot login.

### Admin - Manage Books

Admin can:

- Add books.
- Remove books.

Remove book rule:

- Do not delete data.
- Set `books.status = REMOVED`.
- Books with `status = BORROWED` cannot be removed.

---

## 9. Page Requirements

### LoginPage

Fields / controls:

- Login Type: Student / Admin
- Account
- Password
- Login button
- Register button

Rules:

- Register button is only for Student mode.
- Student login success redirects to `/student`.
- Admin login success redirects to `/admin`.

---

### RegisterPage

Fields / controls:

- Student No
- Name
- Password
- Role Level: NORMAL / VIP
- Register button
- Back button

---

### UserDashboard

Display:

```txt
Welcome, <name> (<role>)
Books due soon: X
```

Buttons:

- Search Books
- My Borrowed Books
- Borrow History
- Due Reminders
- Logout

---

### SearchBooksPage

Table columns:

- ID
- Title
- Authors
- Subjects
- Status

Buttons:

- Search
- Borrow Selected Book
- View Book Borrow History
- Back

Rules:

- `AVAILABLE` books can be borrowed.
- `BORROWED` and `REMOVED` books cannot be borrowed.
- General users should preferably not see `REMOVED` books.

---

### MyBorrowedBooksPage

Table columns:

- Record ID
- Book ID
- Title
- Borrow Date
- Due Date
- Borrow Days
- Status

Buttons:

- Refresh
- Return Selected Book
- Back

---

### BorrowHistoryPage

Table columns:

- Record ID
- Book ID
- Title
- Borrow Date
- Due Date
- Return Date
- Borrow Days
- Status

Buttons:

- Refresh
- Back

---

### DueRemindersPage

Table columns:

- Record ID
- Book ID
- Title
- Borrow Date
- Due Date
- Borrow Days
- Status
- Reminder

Buttons:

- Refresh
- Back

---

### BookBorrowHistoryPage

Table columns:

- Record ID
- Student No
- User Name
- Borrow Date
- Due Date
- Return Date
- Borrow Days
- Status

Buttons:

- Refresh
- Back

---

### AdminDashboard

Buttons:

- View All Borrow Records
- View All Books / Manage Books
- Manage Users
- Logout

---

### AllBorrowRecordsPage

Table columns:

- Record ID
- Student No
- User Name
- Book ID
- Book Title
- Borrow Date
- Due Date
- Return Date
- Borrow Days
- Status

Buttons:

- Refresh
- Back

---

### ManageUsersPage

Table columns:

- User ID
- Student No
- Name
- Role Level
- Status
- Created At

Buttons:

- Refresh
- Suspend Selected User
- Reactivate Selected User
- Back

---

### ManageBooksPage

Table columns:

- Book ID
- Title
- Authors
- Subjects
- Publisher
- Publish Year
- Edition
- ISBN
- Status

Buttons:

- Refresh
- Add Book
- Remove Selected Book
- Back

Rules:

- `BORROWED` books cannot be removed.
- Removing a book means setting `status = REMOVED`.

---

## 10. Frontend Display Rules

### Book Status

```txt
AVAILABLE -> Can borrow
BORROWED -> Cannot borrow
REMOVED -> Should be hidden from student pages or shown as unavailable
```

### User Status

```txt
ACTIVE -> Can login
SUSPENDED -> Cannot login
```

### User Role

```txt
Student -> Student pages
Admin -> Admin pages
```

---

## 11. Development Order

Please implement step by step.

### Step 1

Create project structure, routing, and basic placeholder pages.

### Step 2

Create mock data and mock API functions.

### Step 3

Implement Login and Register using mock API.

### Step 4

Implement UserDashboard and student navigation.

### Step 5

Implement Search Books and Borrow Book.

### Step 6

Implement My Borrowed Books and Return Book.

### Step 7

Implement Borrow History and Due Reminders.

### Step 8

Implement AdminDashboard.

### Step 9

Implement Manage Users.

### Step 10

Implement Manage Books.

### Step 11

Implement All Borrow Records.

### Step 12

Polish UI and prepare for future API integration.

---

## 12. Important Codex Rules

When working on this project, Codex must follow these rules:

1. Do not rewrite the entire project unless explicitly requested.
2. Do not modify backend, Java Swing, JDBC, or MySQL files.
3. Do not connect directly to MySQL from the frontend.
4. Do not assume real API endpoints exist yet.
5. Use mock API functions in `src/api/`.
6. Keep code modular and easy to replace with axios later.
7. Use React Router for page navigation.
8. Keep UI clean and simple.
9. Use a blue technology-style design.
10. Add short Chinese comments in important code sections.
11. After each step, list created and modified files.
12. Each step should be small and testable.

---

## 13. Future API Integration Plan

For now, API functions should be mock functions.

Example now:

```js
export async function studentLogin(account, password) {
  // mock login logic
}
```

Future version:

```js
export async function studentLogin(account, password) {
  return axios.post('/api/auth/student-login', { account, password });
}
```

Only files in `src/api/` should need major changes when real backend APIs are available.

---

## 14. Current Priority

Current priority is frontend prototype, not backend integration.

Build a working clickable website prototype using mock data first.
