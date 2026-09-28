import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { extractApiMessage } from '../api/errorMessage';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Response cua POST /auth/login - backend tra `{ user, tokens }` (long). */
interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  /** Dang goi API dang nhap - tranh bam nut nhieu lan. */
  loading: boolean;
  setAuth: (tokens: AuthTokens, user: AuthUser) => void;
  /** Xoa phien (dang xuat, hoac token het hieu khong lam moi duoc). */
  clearAuth: () => void;
  /**
   * Dang nhap bang email + mat khau.
   *
   * Khong mo phien cho tai khoan khong phai ADMIN: dang nhap duoc nhung
   * `RequireAdmin` se day nguoi dung ngay ve /login trong khi token van con
   * trong localStorage. Giu chinh sach nay o day de khong sot.
   */
  login: (email: string, password: string) => Promise<AuthUser>;
}

export const ADMIN_ROLE = 'ADMIN';

const RONG: Pick<AuthState, 'accessToken' | 'refreshToken' | 'user' | 'loading'> = {
  accessToken: null,
  refreshToken: null,
  user: null,
  loading: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...RONG,
      setAuth: (tokens, user) =>
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user }),
      clearAuth: () => set(RONG),
      login: async (email, password) => {
        set({ loading: true });
        let data: LoginResponse;
        try {
          const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
          data = res.data;
        } catch (e) {
          set({ loading: false });
          throw new Error(extractApiMessage(e, 'Đăng nhập thất bại, vui lòng thử lại'));
        }

        if (data.user.role !== ADMIN_ROLE) {
          set(RONG);
          throw new Error('[AUTH-09] Bạn không có quyền truy cập trang quản trị');
        }

        set({
          accessToken: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          user: data.user,
          loading: false,
        });
        return data.user;
      },
    }),
    { name: 'cookbook-admin-auth' },
  ),
);
