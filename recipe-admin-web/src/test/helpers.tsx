/**
 * Tien ich dung chung cho test React.
 *
 * Gom san QueryClientProvider + MemoryRouter + AuthProvider de test khong phai
 * lap lai 3 tang boc o moi file, va reset luon store auth giua cac test -
 * zustand `persist` ghi xuong localStorage nen test sau se thay du lieu test truoc.
 */
import type { ReactElement } from 'react';
import { render, screen, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { useAuthStore, type AuthUser } from '../stores/authStore';

export const ADMIN_USER: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'admin@cookbook.vn',
  displayName: 'Quản Trị Viên',
  role: 'ADMIN',
};

export const NORMAL_USER: AuthUser = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'demo@cookbook.vn',
  displayName: 'Người Dùng Thường',
  role: 'USER',
};

/** Xoa hoan toan phien dang nhap (ke ca localStorage) truoc moi test. */
export function resetAuth() {
  localStorage.clear();
  useAuthStore.setState({ accessToken: null, refreshToken: null, user: null, loading: false });
}

/** Mo phien dang nhap cua quan tri vien. */
export function signInAdmin(user: AuthUser = ADMIN_USER) {
  useAuthStore.getState().setAuth(
    { accessToken: 'access-token-test', refreshToken: 'refresh-token-test' },
    user,
  );
}

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Duong dan mo trang, dung cho test redirect. */
  route?: string;
  state?: unknown;
}

export function renderWithProviders(ui: ReactElement, { route = '/', state, ...options }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: route, state }]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
    options,
  );
}

/**
 * Hien thi duong dan hien tai va `state.from`, de test redirect khong phai do DOM.
 */
export function LocationProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '';
  return (
    <>
      <div data-testid="path">{location.pathname}</div>
      <div data-testid="from">{from}</div>
    </>
  );
}

/** Doc duong dan hien tai sau khi component da chuyen trang. */
export function currentPath(): string {
  return screen.getByTestId('path').textContent ?? '';
}
