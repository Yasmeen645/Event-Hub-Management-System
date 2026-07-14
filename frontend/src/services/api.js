import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
});

//api.interceptors.request.use((config) => {
//  const token = localStorage.getItem('token');
//  if (token) {
//    config.headers.Authorization = `Bearer ${token}`;
//  }
//  return config;
//});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user) {
    config.headers['X-User-Username'] = user.username;
    config.headers['X-User-Role'] = user.role;
    config.headers['X-User-Id'] = user.userId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// ===== EVENTS =====
export const eventsApi = {
  getAll: (type) => api.get('/api/events', { params: type ? { type } : {} }),
  getById: (id) => api.get(`/api/events/${id}`),
  getMyEvents: () => api.get('/api/events/my-events'),
  getPending: () => api.get('/api/events/pending'),
  getAllAdmin: () => api.get('/api/events/admin/all'),
  create: (formData) => api.post('/api/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/api/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  approve: (id, data) => api.put(`/api/events/${id}/approval`, data),
};

// ===== TICKETS =====
export const ticketsApi = {
  book: (data) => api.post('/api/tickets/book', data),
  getMyTickets: () => api.get('/api/tickets/my-tickets'),
  getById: (id) => api.get(`/api/tickets/${id}`),
  downloadPdf: (id) => api.get(`/api/tickets/${id}/download`, { responseType: 'blob' }),
  confirmPayment: (id, paymentId) => api.put(`/api/tickets/${id}/confirm-payment`, { paymentId }),
};

// ===== PAYMENTS =====
export const paymentsApi = {
  createIntent: (data) => api.post('/api/payments/create-intent', data),
  confirm: (data) => api.post('/api/payments/confirm', data),
};

// ===== USERS =====
export const usersApi = {
  getAll: () => api.get('/api/users'),
  toggleStatus: (id) => api.put(`/api/users/${id}/toggle-status`),
};

export const notificationsApi = {
  getMy: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
};
export default api;
