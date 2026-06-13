import httpClient from './httpClient.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const normalizeBook = (book) => ({
  book_id: book.book_id ?? book.bookId,
  title: book.title || '',
  authors: book.authors || '',
  subjects: book.subjects || '',
  publisher: book.publisher || '',
  publish_year: book.publish_year ?? book.publishYear ?? '',
  edition: book.edition || '',
  format_desc: book.format_desc ?? book.formatDesc ?? '',
  source: book.source || '',
  isbn: book.isbn || '',
  note: book.note || '',
  status: book.status || 'AVAILABLE',
});

const normalizeUser = (user) => ({
  user_id: user.user_id ?? user.userId,
  student_no: user.student_no ?? user.studentNo,
  name: user.name || '',
  role_level: user.role_level ?? user.roleLevel,
  status: user.status || '',
  created_at: user.created_at ?? user.createdAt,
});

const normalizeBorrowRecord = (record) => ({
  ...record,
  record_id: record.record_id ?? record.recordId,
  student_no: record.student_no ?? record.studentNo,
  user_name: record.user_name ?? record.userName,
  book_id: record.book_id ?? record.bookId,
  book_title: record.book_title ?? record.bookTitle ?? record.title,
  borrow_date: record.borrow_date ?? record.borrowDate,
  due_date: record.due_date ?? record.dueDate,
  return_date: record.return_date ?? record.returnDate ?? null,
  borrow_days: record.borrow_days ?? record.borrowDays,
  record_status: record.record_status ?? record.recordStatus,
});

const normalizeTopBook = (book) => ({
  ...book,
  rank: book.rank,
  book_id: book.book_id ?? book.bookId,
  title: book.title || '',
  borrow_count: book.borrow_count ?? book.borrowCount ?? 0,
  reservation_count: book.reservation_count ?? book.reservationCount ?? 0,
});

const normalizeTopSubject = (subject) => ({
  ...subject,
  rank: subject.rank,
  subject: subject.subject ?? subject.subjects ?? '',
  subjects: subject.subjects ?? subject.subject ?? '',
  book_count: subject.book_count ?? subject.bookCount ?? 0,
  borrow_count: subject.borrow_count ?? subject.borrowCount ?? 0,
});

const getArrayData = (payload) => (Array.isArray(payload) ? payload : payload?.data || []);

const actionResult = (payload, successMessage, data = null) => {
  if (!payload?.ok) {
    return fail(payload?.message || 'Request failed.', data);
  }

  return ok(payload.message || successMessage, data);
};

export async function getAllBorrowRecords(keyword = '') {
  try {
    const response = await httpClient.get('/api/admin/borrow-records', {
      params: keyword ? { keyword } : {},
    });

    return ok(
      'All borrow records loaded successfully.',
      getArrayData(response.data).map(normalizeBorrowRecord),
    );
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin borrow records request failed.', []);
  }
}

export async function getAllUsers(keyword = '') {
  try {
    const response = await httpClient.get('/api/admin/users', {
      params: keyword ? { keyword } : {},
    });

    return ok('All users loaded successfully.', getArrayData(response.data).map(normalizeUser));
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin users request failed.', []);
  }
}

export async function suspendUser(userId) {
  try {
    const response = await httpClient.patch(`/api/admin/users/${userId}/status`, {
      status: 'SUSPENDED',
    });

    return actionResult(response.data, 'User suspended successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Suspend user request failed.', null);
  }
}

export async function reactivateUser(userId) {
  try {
    const response = await httpClient.patch(`/api/admin/users/${userId}/status`, {
      status: 'ACTIVE',
    });

    return actionResult(response.data, 'User reactivated successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Reactivate user request failed.', null);
  }
}

export async function getAllBooks(keyword = '') {
  try {
    const response = await httpClient.get('/api/admin/books', {
      params: keyword ? { keyword } : {},
    });

    return ok('All books loaded successfully.', getArrayData(response.data).map(normalizeBook));
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin books request failed.', []);
  }
}

export async function addBook(bookData) {
  try {
    const response = await httpClient.post('/api/admin/books', {
      title: bookData.title || '',
      authors: bookData.authors || '',
      subjects: bookData.subjects || '',
      publisher: bookData.publisher || '',
      publishYear: bookData.publish_year ?? bookData.publishYear ?? '',
      edition: bookData.edition || '',
      formatDesc: bookData.format_desc ?? bookData.formatDesc ?? '',
      source: bookData.source || '',
      isbn: bookData.isbn || '',
      note: bookData.note || '',
    });

    return actionResult(response.data, 'Book added successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Add book request failed.', null);
  }
}

export async function removeBook(bookId) {
  try {
    const response = await httpClient.patch(`/api/admin/books/${bookId}/remove`);
    return actionResult(response.data, 'Book removed successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Remove book request failed.', null);
  }
}

export async function restoreBook(bookId) {
  try {
    const response = await httpClient.patch(`/api/admin/books/${bookId}/restore`);
    return actionResult(response.data, 'Book restored successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Restore book request failed.', null);
  }
}

export async function getLibraryStatistics() {
  try {
    const [
      topBooksResponse,
      topSubjectsResponse,
      booksResponse,
      usersResponse,
      borrowRecordsResponse,
      reservationsResponse,
    ] = await Promise.all([
      httpClient.get('/api/admin/statistics/top-books'),
      httpClient.get('/api/admin/statistics/top-subjects'),
      httpClient.get('/api/admin/books'),
      httpClient.get('/api/admin/users'),
      httpClient.get('/api/admin/borrow-records'),
      httpClient.get('/api/admin/reservations'),
    ]);
    const books = getArrayData(booksResponse.data).map(normalizeBook);
    const users = getArrayData(usersResponse.data).map(normalizeUser);
    const borrowRecords = getArrayData(borrowRecordsResponse.data).map(normalizeBorrowRecord);
    const reservations = getArrayData(reservationsResponse.data);

    return ok('Library statistics loaded successfully.', {
      totalBooks: books.length,
      borrowedBooks: books.filter((book) => book.status === 'BORROWED').length,
      reservedBooks: books.filter((book) => book.status === 'RESERVED').length,
      activeUsers: users.filter((user) => user.status === 'ACTIVE').length,
      suspendedUsers: users.filter((user) => user.status === 'SUSPENDED').length,
      totalBorrowRecords: borrowRecords.length,
      totalReservations: reservations.length,
      popularBooks: getArrayData(topBooksResponse.data).map(normalizeTopBook),
      popularSubjects: getArrayData(topSubjectsResponse.data).map(normalizeTopSubject),
    });
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin statistics request failed.', {
      totalBooks: 0,
      borrowedBooks: 0,
      reservedBooks: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      totalBorrowRecords: 0,
      totalReservations: 0,
      popularBooks: [],
      popularSubjects: [],
    });
  }
}
