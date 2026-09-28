/**
 * Test hook `useAuth` - noi day du nhat de component doc phien dang nhap.
 *
 * Khoa chinh: chinh sach "chi ADMIN moi duoc vao trang quan tri" phai nam
 * trong `login()`, khong phai o trang hien thi, neu khong token cua tai khoan
 * thuong se con nam trong localStorage sau khi bi day ve /login.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { Component, createElement, type ReactNode } from 'react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../api/client';
import { resetAuth, signInAdmin, ADMIN_USER, NORMAL_USER } from '../test/helpers';

function wrapper({ children }: { children: ReactNode }) {
  return createElement(AuthProvider, null, children);
}

/**
 * React 18 nem loi cua render ra console chu khong nem lai cho
 * `render()` dong bo, nen phai co boundary de bat va kiem tra thong diep.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { message: e instanceof Error ? e.message : String(e) };
  }
  render() {
    return this.state.message ? <div data-testid="loi">{this.state.message}</div> : this.props.children;
  }
}

beforeEach(() => {
  resetAuth();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAuth - noi suy luc chua dang nhap', () => {
  it('bao loi khi goi ngoai <AuthProvider>', () => {
    function Probe() {
      useAuth();
      return null;
    }
    render(
      <ErrorBoundary>
        <Probe />
      </ErrorBoundary>,
    );
    expect(document.querySelector('[data-testid="loi"]')?.textContent).toMatch(
      /useAuth\(\) phai duoc goi ben trong <AuthProvider>/,
    );
  });

  it('mac dinh: chua dang nhap, khong phai admin', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });
});

describe('useAuth - nhan biet phien', () => {
  it('co token + user ADMIN -> authenticated va admin', () => {
    signInAdmin();
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual(ADMIN_USER);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('co token + user USER -> authenticated nhung khong admin', () => {
    signInAdmin(NORMAL_USER);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('logout() xoa sach phien', () => {
    signInAdmin();
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});

describe('useAuth - login', () => {
  it('dang nhap ADMIN thanh cong: luu token va tra ve user', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        user: ADMIN_USER,
        tokens: { accessToken: 'a1', refreshToken: 'r1' },
      },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });
    let returned: unknown;
    await act(async () => {
      returned = await result.current.login('admin@cookbook.vn', 'AdminPass123');
    });

    expect(spy).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@cookbook.vn',
      password: 'AdminPass123',
    });
    expect(returned).toEqual(ADMIN_USER);
    expect(result.current.isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('a1');
    expect(useAuthStore.getState().refreshToken).toBe('r1');
    expect(result.current.loading).toBe(false);
  });

  it('bat loading trong khi goi API', async () => {
    let resolvePost: (v: unknown) => void = () => {};
    vi.spyOn(apiClient, 'post').mockReturnValue(
      new Promise((res) => {
        resolvePost = res as (v: unknown) => void;
      }) as never,
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    let pending: Promise<unknown>;
    act(() => {
      pending = result.current.login('admin@cookbook.vn', 'AdminPass123');
    });
    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolvePost({ data: { user: ADMIN_USER, tokens: { accessToken: 'a', refreshToken: 'r' } } });
      await pending;
    });
    expect(result.current.loading).toBe(false);
  });

  it('sai mat khau: nem loi tieng Viet tu backend va KHONG luu phien', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      response: { data: { message: '[AUTH-11] Email hoặc mật khẩu không chính xác' } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await expect(result.current.login('sai@cookbook.vn', 'x')).rejects.toThrow(
        '[AUTH-11] Email hoặc mật khẩu không chính xác',
      );
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('khong phai ADMIN: bao [AUTH-09] va xoa token (khong mo phien)', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { user: NORMAL_USER, tokens: { accessToken: 'a', refreshToken: 'r' } },
    } as never);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await expect(result.current.login('demo@cookbook.vn', 'DemoPass123')).rejects.toThrow('[AUTH-09]');
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('backend tra danh sach loi (class-validator) -> lay loi dau tien', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      response: { data: { message: ['email phải là email hợp lệ', 'mật khẩu quá ngắn'] } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await expect(result.current.login('x', 'y')).rejects.toThrow('email phải là email hợp lệ');
    });
  });
});
