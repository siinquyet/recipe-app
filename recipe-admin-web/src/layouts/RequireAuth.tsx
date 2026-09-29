import { Navigate, Outlet } from 'react-router-dom';

// BR-AUTH: Guard nhánh user — thiếu user_access_token thì về /dang-nhap
export function RequireAuth() {
  const token = localStorage.getItem('user_access_token');
  if (!token) return <Navigate to="/dang-nhap" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const token = localStorage.getItem('admin_access_token');
  if (!token) return <Navigate to="/admin/dang-nhap" replace />;
  return <Outlet />;
}
