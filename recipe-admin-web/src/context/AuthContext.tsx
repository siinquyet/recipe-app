import { createContext, useMemo, type ReactNode } from 'react';
import { useAuthStore, ADMIN_ROLE, type AuthUser } from '../stores/authStore';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Chi quan tri vien moi duoc vao trang quan tri. */
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  /**
   * Dong phien. Chi goi `clearAuth` cua store - khong tu xoa `user`/`token`
   * o day, tranh hai noi cung quan ly mot trang thai.
   */
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider cho trang quan tri.
 *
 * Noi suy lieu lay tu `useAuthStore` (zustand) chu khong luu state rieng, nen
 * Context khong phai mot "nguon su that" thu hai - no chi la noi day du nhat
 * cho component React. Ly do giu zustand o duoi:
 * interceptor cua axios can doc/ghi token **ngoai** React (khong co Provider,
 * khong co hook), va zustand cho `getState()` o moi noi.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const logout = clearAuth;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(accessToken && user),
      isAdmin: user?.role === ADMIN_ROLE,
      loading,
      login,
      logout,
    }),
    [user, accessToken, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
