import instance from './axios';

export function register({ username, password }) {
  return instance.post('/api/auth/register/', { username, password });
}

export function login({ username, password }) {
  return instance.post('/api/auth/login/', { username, password });
}

export function logout() {
  return instance.post('/api/auth/logout/');
}

export function getProfile() {
  return instance.get('/api/auth/profile/');
}

export function updateProfile(data) {
  return instance.put('/api/auth/profile/', data);
}
