import axios from 'axios';

// BR-API: Dùng chung backend /api/v1 với mobile, token user riêng key user_access_token
export const userApiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

userApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
