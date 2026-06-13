import httpClient from './httpClient.js';

const ok = (message, data = null) => Promise.resolve({ success: true, message, data });
const fail = (message, data = null) => Promise.resolve({ success: false, message, data });

const normalizeReservation = (reservation) => ({
  ...reservation,
  reservation_id: reservation.reservation_id ?? reservation.reservationId,
  user_id: reservation.user_id ?? reservation.userId,
  book_id: reservation.book_id ?? reservation.bookId,
  reserved_at: reservation.reserved_at ?? reservation.reservedAt ?? reservation.reservationTime,
  reservation_time:
    reservation.reservation_time ?? reservation.reservationTime ?? reservation.reserved_at ?? reservation.reservedAt,
  created_at: reservation.created_at ?? reservation.createdAt,
  status: reservation.status,
  student_no: reservation.student_no ?? reservation.studentNo ?? reservation.user?.studentNo ?? '',
  user_name: reservation.user_name ?? reservation.userName ?? reservation.user?.name ?? '',
  book_title: reservation.book_title ?? reservation.bookTitle ?? reservation.title ?? reservation.book?.title ?? '',
  book: reservation.book || null,
  user: reservation.user || null,
});

const getArrayData = (payload) => (Array.isArray(payload) ? payload : payload?.data || []);

const actionResult = (payload, successMessage, data = null) => {
  if (!payload?.ok) {
    return fail(payload?.message || 'Request failed.', data);
  }

  return ok(payload.message || successMessage, data);
};

export async function reserveBook(userId, bookId) {
  try {
    const response = await httpClient.post('/api/reservations', { userId, bookId });
    return actionResult(response.data, 'Book reserved successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Reservation request failed.', null);
  }
}

export async function getMyReservations(userId) {
  try {
    const response = await httpClient.get(`/api/users/${userId}/reservations`);
    return ok('Reservations loaded successfully.', getArrayData(response.data).map(normalizeReservation));
  } catch (error) {
    return fail(error.response?.data?.message || 'Reservations request failed.', []);
  }
}

export async function cancelReservation(userId, reservationId) {
  try {
    const response = await httpClient.patch(
      `/api/users/${userId}/reservations/${reservationId}/cancel`,
    );
    return actionResult(response.data, 'Reservation cancelled successfully.', response.data);
  } catch (error) {
    return fail(error.response?.data?.message || 'Cancel reservation request failed.', null);
  }
}

export async function getAllReservations(keyword = '') {
  try {
    const response = await httpClient.get('/api/admin/reservations', {
      params: keyword ? { keyword } : {},
    });

    return ok('All reservations loaded successfully.', getArrayData(response.data).map(normalizeReservation));
  } catch (error) {
    return fail(error.response?.data?.message || 'Admin reservations request failed.', []);
  }
}
