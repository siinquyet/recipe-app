import { createBrowserRouter, Navigate } from 'react-router-dom';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RequireAdmin, RequireAuth } from '../layouts/RequireAuth';
import { RecipeList } from '../pages/RecipeList';
import { TrangChu } from '../pages/user/TrangChu';
import { TimKiem } from '../pages/user/TimKiem';
import { ChiTietCongThuc } from '../pages/user/ChiTietCongThuc';
import { DangNhap } from '../pages/user/DangNhap';
import { DangKy } from '../pages/user/DangKy';
import { QuenMatKhau } from '../pages/user/QuenMatKhau';
import { DieuKhoan } from '../pages/user/DieuKhoan';
import { BaoMat } from '../pages/user/BaoMat';
import { LienHe } from '../pages/user/LienHe';
import { YeuThich } from '../pages/user/YeuThich';
import { HoSo } from '../pages/user/HoSo';
import { CongThucCuaToi } from '../pages/user/CongThucCuaToi';
import { KeHoach } from '../pages/user/KeHoach';
import { DiCho } from '../pages/user/DiCho';
import { TaoCongThuc } from '../pages/user/TaoCongThuc';

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: '/', element: <TrangChu /> },
      { path: '/tim-kiem', element: <TimKiem /> },
      { path: '/cong-thuc/:id', element: <ChiTietCongThuc /> },
      { path: '/dang-nhap', element: <DangNhap /> },
      { path: '/dang-ky', element: <DangKy /> },
      { path: '/quen-mat-khau', element: <QuenMatKhau /> },
      { path: '/dieu-khoan', element: <DieuKhoan /> },
      { path: '/bao-mat', element: <BaoMat /> },
      { path: '/lien-he', element: <LienHe /> },
      { path: '/ke-hoach', element: <KeHoach /> },
      { path: '/di-cho', element: <DiCho /> },
      { path: '/ho-so', element: <HoSo /> },
      // BR-AUTH: Hồ sơ gộp Cài đặt theo design (1 màn) — giữ route cũ để không gãy link
      { path: '/cai-dat', element: <Navigate to="/ho-so" replace /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/yeu-thich', element: <YeuThich /> },
          { path: '/cong-thuc-cua-toi', element: <CongThucCuaToi /> },
          { path: '/cong-thuc/moi', element: <TaoCongThuc /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        element: <RequireAdmin />,
        children: [{ index: true, element: <RecipeList /> }],
      },
    ],
  },
]);
