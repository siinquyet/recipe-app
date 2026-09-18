import { createBrowserRouter } from 'react-router-dom';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RequireAdmin, RequireAuth } from '../layouts/RequireAuth';
import { RecipeList } from '../pages/RecipeList';
import { TrangChu } from '../pages/user/TrangChu';
import { TimKiem } from '../pages/user/TimKiem';
import { ChiTietCongThuc } from '../pages/user/ChiTietCongThuc';
import { DangNhap } from '../pages/user/DangNhap';
import { DangKy } from '../pages/user/DangKy';
import { YeuThich } from '../pages/user/YeuThich';
import { HoSo } from '../pages/user/HoSo';
import { CaiDat } from '../pages/user/CaiDat';
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
      { path: '/ke-hoach', element: <KeHoach /> },
      { path: '/di-cho', element: <DiCho /> },
      { path: '/ho-so', element: <HoSo /> },
      { path: '/cai-dat', element: <CaiDat /> },
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
