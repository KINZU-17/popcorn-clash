import { API_BASE_URL } from '../config';
const REQUEST_TIMEOUT = 10000;

function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (err.message === 'Failed to fetch' || err.type === 'error') {
      throw new Error('Network error. Unable to reach the server.');
    }
    throw new Error(err.message || 'Request failed');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    google: (credential) => request('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
    forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: ({ email, code, token, newPassword }) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, token, new_password: newPassword, password: newPassword }) }),
  },


  fixtures: {
    list: () => request('/api/fixtures'),
    get: (id) => request(`/api/fixtures/${id}`),
    create: (data) => request('/api/fixtures', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/api/fixtures/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  teams: {
    list: () => request('/api/teams'),
    leaderboard: () => request('/api/teams/leaderboard'),
  },
  predictions: {
    create: (data) => request('/api/predictions', { method: 'POST', body: JSON.stringify(data) }),
    listForFixture: (fixtureId) => request(`/api/predictions/fixture/${fixtureId}`),
  },
  users: {
    profile: () => request('/api/users/profile'),
    updateProfile: (data) => request('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    list: () => request('/api/users'),
    search: (query = '', excludeSelf = false) => {
      const params = new URLSearchParams({ q: query });
      if (excludeSelf) params.set('exclude_self', 'true');
      return request(`/api/users/search?${params.toString()}`);
    },
  },
  movies: {
    list: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.query) qs.set('q', params.query);
      if (params.genre) qs.set('genre', params.genre);
      if (params.limit) qs.set('limit', String(params.limit));
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return request(`/api/movies${suffix}`);
    },
    get: (id) => request(`/api/movies/${id}`),
    create: (data) => request('/api/movies', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => request(`/api/movies/${id}`, { method: 'DELETE' }),
    status: () => request('/api/movies/status'),
    setStatus: (id, patch) => request(`/api/movies/${id}/status`, { method: 'PATCH', body: JSON.stringify(patch) }),
  },
  reviews: {
    list: () => request('/api/reviews'),
    create: async (data) => {
      const res = await request('/api/reviews', { method: 'POST', body: JSON.stringify(data) });
      return res.review || res;
    },
    update: async (id, data) => {
      const res = await request(`/api/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      return res.review || res;
    },
    delete: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
  },
  history: {
    list: () => request('/api/history'),
    create: (data) => request('/api/history', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/history/${id}`, { method: 'DELETE' }),
  },
  admin: {
    getStats: () => request('/api/admin/stats'),
    listUsers: (page = 1, per_page = 10) => {
      return request(`/api/admin/users?page=${page}&per_page=${per_page}`);
    },
    searchUsers: (query, page = 1, per_page = 10) => {
      const params = new URLSearchParams({ q: query, page: String(page), per_page: String(per_page) });
      return request(`/api/admin/users/search?${params.toString()}`);
    },
    updateUserRole: (id) => request(`/api/admin/users/${id}/role`, { method: 'PATCH' }),
    deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
    banUser: (id, is_banned) => request(`/api/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ is_banned }) }),
    deleteReview: (id) => request(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    deleteMovie: (id) => request(`/api/admin/movies/${id}`, { method: 'DELETE' }),
    listMovies: (page = 1, per_page = 10) => request(`/api/admin/movies?page=${page}&per_page=${per_page}`),
    listReviews: (page = 1, per_page = 10) => request(`/api/admin/reviews?page=${page}&per_page=${per_page}`),
    listFixtures: (page = 1, per_page = 10) => request(`/api/admin/fixtures?page=${page}&per_page=${per_page}`),
    getLogs: () => request('/api/admin/logs'),
    getRecentActivity: () => request('/api/admin/activity/recent'),
    cleanupPasswordResets: () => request('/api/admin/password-resets/cleanup', { method: 'DELETE' }),
  },
};
