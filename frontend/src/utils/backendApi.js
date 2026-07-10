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
};
