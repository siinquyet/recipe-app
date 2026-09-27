// Axios client dùng chung: tự gắn Bearer token, xử lý 401 (refresh + logout)
// Mã lỗi backend theo quy tắc: [MODULE-XX] Mô tả lỗi bằng tiếng Việt
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy access token mới từ refresh token khi hết hạn
async function tryRefresh(): Promise<boolean> {
  const { refreshToken, setAuth } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefresh } = res.data.tokens;
    setAuth({ accessToken, refreshToken: newRefresh }, useAuthStore.getState().user!);
    return true;
  } catch {
    return false;
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // 401 và chưa thử refresh một lần
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      const ok = await tryRefresh();
      if (ok) return apiClient(original);
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);