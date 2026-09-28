/**
 * Test khung trang quan tri: Sidebar + Header + AdminLayout.
 *
 * AdminLayout la noi bao ve duy nhat cho 7 trang con, nen phai khoa 3 nhanh:
 * chua dang nhap, dang nhap nhung khong phai ADMIN, va da dang nhap.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminLayout from './AdminLayout';
import { NAV_ITEMS } from './navItems';
import { useAuthStore } from '../stores/authStore';
import {
  renderWithProviders,
  resetAuth,
  signInAdmin,
  ADMIN_USER,
  NORMAL_USER,
  LocationProbe,
  currentPath,
} from '../test/helpers';

beforeEach(() => {
  resetAuth();
});

describe('Sidebar', () => {
  it('render du 7 muc dieu huong', () => {
    renderWithProviders(<Sidebar />, { route: '/' });
    const links = screen.getAllByRole('link');
    expect(NAV_ITEMS).toHaveLength(7);
    expect(links).toHaveLength(NAV_ITEMS.length);
    expect(screen.getByRole('link', { name: /Trang chủ/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Người dùng/ })).toHaveAttribute('href', '/users');
  });

  it('highlight muc dang mo; muc goc "/" khong highlight o trang con', () => {
    renderWithProviders(<Sidebar />, { route: '/recipes/pending' });
    expect(screen.getByRole('link', { name: /Duyệt bài/ })).toHaveClass('font-medium');
    expect(screen.getByRole('link', { name: /Trang chủ/ })).not.toHaveClass('font-medium');
  });
});

describe('Header', () => {
  it('hien ten nguoi dung va nhan ADMIN', () => {
    signInAdmin();
    renderWithProviders(<Header />, { route: '/' });
    expect(screen.getByText(ADMIN_USER.displayName)).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('bam "Đăng xuất" -> xoa phien va ve /login', async () => {
    signInAdmin();
    renderWithProviders(
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/login" element={<LocationProbe />} />
      </Routes>,
      { route: '/' },
    );

    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));

    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});

describe('AdminLayout - bao ve route', () => {
  /** Khoi route giong het App.tsx: 7 trang con + trang dang nhap. */
  function Layout() {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route
            path="/"
            element={
              <>
                <span data-testid="page">trang chu</span>
                <LocationProbe />
              </>
            }
          />
          <Route
            path="/users"
            element={
              <>
                <span data-testid="page">nguoi dung</span>
                <LocationProbe />
              </>
            }
          />
        </Route>
        <Route path="/login" element={<LocationProbe />} />
      </Routes>
    );
  }

  it('chua dang nhap -> day ve /login va KHONG render trang con', async () => {
    renderWithProviders(<Layout />, { route: '/users' });
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.queryByTestId('page')).not.toBeInTheDocument();
  });

  it('chua dang nhap -> giu lai duong dan trong state.from de quay lai sau khi login', async () => {
    renderWithProviders(<Layout />, { route: '/users' });
    await waitFor(() => expect(screen.getByTestId('from')).toHaveTextContent('/users'));
  });

  it('dang nhap nhung khong phai ADMIN -> ve /login, khong giu from (tranh loop)', async () => {
    signInAdmin(NORMAL_USER);
    renderWithProviders(<Layout />, { route: '/users' });
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(screen.getByTestId('from')).toHaveTextContent('');
    expect(screen.queryByTestId('page')).not.toBeInTheDocument();
  });

  it('ADMIN -> hien du sidebar, header va noi dung con', async () => {
    signInAdmin();
    renderWithProviders(<Layout />, { route: '/' });
    expect(await screen.findByTestId('page')).toHaveTextContent('trang chu');
    expect(screen.getByRole('link', { name: /Người dùng/ })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_USER.displayName)).toBeInTheDocument();
    expect(currentPath()).toBe('/');
  });

  it('ADMIN vao trang con -> van co sidebar + header', async () => {
    signInAdmin();
    renderWithProviders(<Layout />, { route: '/users' });
    expect(await screen.findByTestId('page')).toHaveTextContent('nguoi dung');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
  });
});
