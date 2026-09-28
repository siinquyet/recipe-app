/**
 * Test interceptor 401 -> refresh token.
 *
 * Bug that: client.ts doc `res.data.tokens` o response cua POST /auth/refresh,
 * nhung backend tra PHAY `{ accessToken, refreshToken, expiresIn }`.
 * Sai do do moi lan 401 deu dan den dang xuat oat thay vi lay token moi.
 * Test nay khoa lai dung hinh dang do, va se fail neu ai do sua ve lai.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from './client';

const USER = { id: 'u1', email: 'admin@cookbook.vn', displayName: 'Quan Tri Vien', role: 'ADMIN' };

/** Adapter: loi 401 o lan goi dau tien, thanh cong o lan goi lai. */
function adapterThatFailsOnce() {
  let calls = 0;
  return async (config: any) => {
    calls++;
    if (calls === 1) {
      return Promise.reject({
        response: { status: 401, data: { message: '[AUTH-08] Refresh token không hợp lệ' } },
        config,
      });
    }
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as any;
  };
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ accessToken: null, refreshToken: null, user: null, loading: false });
  vi.restoreAllMocks();
});

describe('apiClient - refresh token', () => {
  it('doc accessToken / refreshToken o response PHAY cua /auth/refresh', async () => {
    useAuthStore.getState().setAuth(
      { accessToken: 'cu', refreshToken: 'token-moi-hien-tai' },
      USER,
    );

    const spy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { accessToken: 'access-moi', refreshToken: 'refresh-moi', expiresIn: 900 },
    } as any);
    const origAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = adapterThatFailsOnce();

    await apiClient.get('/recipes');

    expect(spy).toHaveBeenCalledWith('/api/v1/auth/refresh', {
      refreshToken: 'token-moi-hien-tai',
    });
    const s = useAuthStore.getState();
    expect(s.accessToken, 'accessToken phai duoc cap nhat tu response phang').toBe('access-moi');
    expect(s.refreshToken, 'refreshToken phai duoc thay the luon').toBe('refresh-moi');
    expect(s.user, 'nguoi dung phai duoc giu nguyen khi refresh').toEqual(USER);

    apiClient.defaults.adapter = origAdapter;
  });

  it('dang xuat khi refresh token khong hop le (401 lan nua)', async () => {
    useAuthStore.getState().setAuth({ accessToken: 'cu', refreshToken: 'sai' }, USER);
    vi.spyOn(axios, 'post').mockRejectedValue({ response: { status: 401, data: {} } });
    const origAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = adapterThatFailsOnce();

    await expect(apiClient.get('/recipes')).rejects.toBeTruthy();

    const s = useAuthStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.user).toBeNull();

    apiClient.defaults.adapter = origAdapter;
  });

  it('khong goi refresh khi chua co refresh token', async () => {
    useAuthStore.setState({ accessToken: 'cu', refreshToken: null, user: USER });
    const spy = vi.spyOn(axios, 'post');
    const origAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = adapterThatFailsOnce();

    await expect(apiClient.get('/recipes')).rejects.toBeTruthy();

    expect(spy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().accessToken).toBeNull();

    apiClient.defaults.adapter = origAdapter;
  });
});
