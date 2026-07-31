const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

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
    create: (data) => request('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/reviews/${id}`, { method: 'DELETE' }),
  },
};
