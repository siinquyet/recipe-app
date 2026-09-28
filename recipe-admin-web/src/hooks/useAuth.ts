import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';

/**
 * Hook duy nhat de component doc trang thai dang nhap.
 *
 * Component khong nen import `useAuthStore` truc tiep: khi do mot component
 * duoc render trong test ma khong boc `<AuthProvider>` se khong lay duoc
 * `user`, va logic "co duoc vao trang quan tri khong" se bi chep lai o nhieu noi.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() phai duoc goi ben trong <AuthProvider>');
  }
  return ctx;
}
