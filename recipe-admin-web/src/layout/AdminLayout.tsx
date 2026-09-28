import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Khung trang quan tri: Sidebar + Header + noi dung con (qua <Outlet/>).
 *
 * Bai nay thay the 7 lan bo `<RequireAdmin>` lap lai trong App.tsx. Cach gom
 * route con vao mot `<Route element={<AdminLayout/>}>` de bao ve chi can khai
 * bao 1 lan; them trang moi chi viet them `<Route path="..." element={...} />`.
 */
export default function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Giu lai `from` de dang nhap xong quay lai dung trang dang xem -
    // truoc day LoginPage luon navigate('/') nen mo link truc tiep toi
    // /users se lam nguoi dung mat trang dang muon xem.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    // Da dang nhap nhung khong phai quan tri: day ve /login ma KHONG kem
    // `from`, neu khong se ve lai chinh trang nay va loop vo han.
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
