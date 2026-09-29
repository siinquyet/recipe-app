import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { dangXuatAdmin } from '../api/admin';

const MUC_ADMIN = [
  { den: '/admin', nhan: 'Tổng quan', het: true },
  { den: '/admin/cho-duyet', nhan: 'Chờ duyệt', het: false },
  { den: '/admin/cong-thuc', nhan: 'Công thức', het: false },
  { den: '/admin/nguoi-dung', nhan: 'Người dùng', het: false },
];

// BR-ADM: Khung quản trị — sidebar điều hướng + nút đăng xuất
export function AdminLayout() {
  const navigate = useNavigate();

  const thoat = () => {
    dangXuatAdmin();
    navigate('/admin/dang-nhap');
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="font-serif text-lg font-black">Bếp Nhà · Quản trị</span>
          <button
            type="button"
            onClick={thoat}
            className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <nav className="flex w-44 shrink-0 flex-col gap-1">
          {MUC_ADMIN.map(({ den, nhan, het }) => (
            <NavLink
              key={den}
              to={den}
              end={het}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-left text-sm font-semibold ${
                  isActive ? 'bg-ink text-white' : 'text-slate-600 hover:bg-white'
                }`
              }
            >
              {nhan}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
