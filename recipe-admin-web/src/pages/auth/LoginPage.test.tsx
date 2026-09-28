/**
 * Test trang dang nhap.
 *
 * Khoa 2 loi that trong ban cu: (1) `RequireAdmin` trong App.tsx luon
 * navigate('/') nen mo link truc tiep toi /users se mat trang dang xem;
 * (2) tai khoan USER dang nhap duoc thi token van con trong localStorage
 * trong khi RequireAdmin da day ve /login.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import {
  renderWithProviders,
  resetAuth,
  signInAdmin,
  ADMIN_USER,
  NORMAL_USER,
  LocationProbe,
  currentPath,
} from '../../test/helpers';

beforeEach(() => {
  resetAuth();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockLoginOk(user = ADMIN_USER) {
  vi.spyOn(apiClient, 'post').mockResolvedValue({
    data: { user, tokens: { accessToken: 'a1', refreshToken: 'r1' } },
  } as never);
}

/** Dien form dang nhap. Dung fireEvent.change vi day la controlled input. */
function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: password } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/ }));
}

function Routes_() {
  return (
    <Routes>
      {/* Probe luon render san de test doc duong dan o ca hai trang
          (trang dang nhap cung khong duoc bo qua). */}
      <Route
        path="/login"
        element={
          <>
            <LoginPage />
            <LocationProbe />
          </>
        }
      />
      <Route path="/" element={<LocationProbe />} />
      <Route path="/users" element={<LocationProbe />} />
    </Routes>
  );
}

describe('LoginPage', () => {
  it('render form co email, mat khau va nut dang nhap', () => {
    renderWithProviders(<Routes_ />, { route: '/login' });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeEnabled();
  });

  it('dang nhap ADMIN thanh cong -> ve trang chu', async () => {
    mockLoginOk();
    renderWithProviders(<Routes_ />, { route: '/login' });

    fillForm('admin@cookbook.vn', 'AdminPass123');
    submit();

    await waitFor(() => expect(currentPath()).toBe('/'));
    expect(useAuthStore.getState().accessToken).toBe('a1');
  });

  it('mo link truc tiep toi /users khi chua dang nhap -> quay lai /users', async () => {
    mockLoginOk();
    renderWithProviders(<Routes_ />, { route: '/login', state: { from: '/users' } });

    fillForm('admin@cookbook.vn', 'AdminPass123');
    submit();

    await waitFor(() => expect(currentPath()).toBe('/users'));
  });

  it('sai mat khau -> hien nguyen van loi tieng Viet tu backend', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      response: { data: { message: '[AUTH-11] Email hoặc mật khẩu không chính xác' } },
    });
    renderWithProviders(<Routes_ />, { route: '/login' });

    fillForm('sai@cookbook.vn', 'sai-mat-khau');
    submit();

    const err = await screen.findByText('[AUTH-11] Email hoặc mật khẩu không chính xác');
    expect(err).toBeInTheDocument();
    expect(currentPath()).toBe('/login');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('tai khoan khong phai ADMIN -> bao [AUTH-09] va khong luu phien', async () => {
    mockLoginOk(NORMAL_USER);
    renderWithProviders(<Routes_ />, { route: '/login' });

    fillForm('demo@cookbook.vn', 'DemoPass123');
    submit();

    expect(await screen.findByText(/\[AUTH-09\]/)).toBeInTheDocument();
    expect(currentPath()).toBe('/login');
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('da dang nhap -> bo qua trang dang nhap, ve thang trang da luu', async () => {
    signInAdmin();
    renderWithProviders(<Routes_ />, { route: '/login', state: { from: '/users' } });
    await waitFor(() => expect(currentPath()).toBe('/users'));
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
  });

  it('khi dang goi API: nut bi khoa va doi chu "Đang đăng nhập..."', async () => {
    let release: (v: unknown) => void = () => {};
    vi.spyOn(apiClient, 'post').mockReturnValue(
      new Promise((res) => {
        release = res as (v: unknown) => void;
      }) as never,
    );
    renderWithProviders(<Routes_ />, { route: '/login' });

    fillForm('admin@cookbook.vn', 'AdminPass123');
    submit();

    const btn = await screen.findByRole('button', { name: 'Đang đăng nhập...' });
    expect(btn).toBeDisabled();

    release({ data: { user: ADMIN_USER, tokens: { accessToken: 'a1', refreshToken: 'r1' } } });
    await waitFor(() => expect(currentPath()).toBe('/'));
  });
});
