import { create } from 'zustand';
import { userApiClient } from '../api/userClient';

export interface NguoiDung {
  id: string;
  email: string;
  tenHienThi: string;
  anhDaiDien: string | null;
}

interface AuthState {
  nguoiDung: NguoiDung | null;
  dangNhap: (email: string, matKhau: string) => Promise<void>;
  dangKy: (tenHienThi: string, email: string, matKhau: string) => Promise<void>;
  napHoSo: () => Promise<void>;
  dangXuat: () => void;
}

function luuTokens(data: { accessToken: string; refreshToken: string }) {
  localStorage.setItem('user_access_token', data.accessToken);
  localStorage.setItem('user_refresh_token', data.refreshToken);
}

function xoaTokens() {
  localStorage.removeItem('user_access_token');
  localStorage.removeItem('user_refresh_token');
}

export const useAuthStore = create<AuthState>((set) => ({
  nguoiDung: null,
  // BR-AUTH: Login chung backend với mobile (POST /auth/login)
  dangNhap: async (email, matKhau) => {
    const res = await userApiClient.post('/auth/login', { email, matKhau });
    luuTokens(res.data.data as { accessToken: string; refreshToken: string });
    const me = await userApiClient.get('/auth/me');
    set({ nguoiDung: (me.data.data as NguoiDung) ?? null });
  },
  // BR-AUTH: Đăng ký (POST /auth/register)
  dangKy: async (tenHienThi, email, matKhau) => {
    const res = await userApiClient.post('/auth/register', { email, matKhau, tenHienThi });
    luuTokens(res.data.data as { accessToken: string; refreshToken: string });
    const me = await userApiClient.get('/auth/me');
    set({ nguoiDung: (me.data.data as NguoiDung) ?? null });
  },
  // BR-AUTH: Nạp hồ sơ khi đã có token (F5 không mất login)
  napHoSo: async () => {
    if (!localStorage.getItem('user_access_token')) return;
    try {
      const me = await userApiClient.get('/auth/me');
      set({ nguoiDung: (me.data.data as NguoiDung) ?? null });
    } catch {
      xoaTokens();
      set({ nguoiDung: null });
    }
  },
  dangXuat: () => {
    xoaTokens();
    set({ nguoiDung: null });
  },
}));
