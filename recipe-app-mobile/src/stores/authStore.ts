import { create } from 'zustand';
import { dangKy, dangNhap, layThongTinNguoiDung } from '../lib/api/auth';
import type { DangKyPayload, DangNhapPayload } from '../lib/api/auth';
import { layAccessToken, luuTokens, xoaTokens } from '../lib/auth/tokenManager';
import { queryClient } from '../lib/queryClient';
import type { NguoiDung } from '../types/api';

interface AuthState {
  nguoiDung: NguoiDung | null;
  daDangNhap: boolean;
  daKhoiTao: boolean;
  dangTai: boolean;
  loi: string | null;
  khoiTao: () => Promise<void>;
  dangNhap: (payload: DangNhapPayload) => Promise<void>;
  dangKy: (payload: DangKyPayload) => Promise<void>;
  dangXuat: () => Promise<void>;
  datNguoiDung: (nguoiDung: NguoiDung | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  nguoiDung: null,
  daDangNhap: false,
  daKhoiTao: false,
  dangTai: false,
  loi: null,

  khoiTao: async () => {
    set({ dangTai: true, loi: null });
    try {
      const token = await layAccessToken();
      if (!token) {
        set({ nguoiDung: null, daDangNhap: false, daKhoiTao: true, dangTai: false });
        return;
      }
      const nguoiDung = await layThongTinNguoiDung();
      set({ nguoiDung, daDangNhap: true, daKhoiTao: true, dangTai: false });
    } catch {
      await xoaTokens();
      set({ nguoiDung: null, daDangNhap: false, daKhoiTao: true, dangTai: false });
    }
  },

  dangNhap: async (payload) => {
    set({ dangTai: true, loi: null });
    try {
      const tokens = await dangNhap(payload);
      await luuTokens(tokens.accessToken, tokens.refreshToken);
      const nguoiDung = await layThongTinNguoiDung();
      queryClient.invalidateQueries();
      set({ nguoiDung, daDangNhap: true, dangTai: false });
    } catch (e) {
      set({ dangTai: false, loi: e instanceof Error ? e.message : 'Đăng nhập thất bại' });
      throw e;
    }
  },

  dangKy: async (payload) => {
    set({ dangTai: true, loi: null });
    try {
      const tokens = await dangKy(payload);
      await luuTokens(tokens.accessToken, tokens.refreshToken);
      const nguoiDung = await layThongTinNguoiDung();
      queryClient.invalidateQueries();
      set({ nguoiDung, daDangNhap: true, dangTai: false });
    } catch (e) {
      set({ dangTai: false, loi: e instanceof Error ? e.message : 'Đăng ký thất bại' });
      throw e;
    }
  },

  dangXuat: async () => {
    await xoaTokens();
    queryClient.clear();
    set({ nguoiDung: null, daDangNhap: false, loi: null });
  },

  datNguoiDung: (nguoiDung) => set({ nguoiDung, daDangNhap: nguoiDung !== null }),
}));
