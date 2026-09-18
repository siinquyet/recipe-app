import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

const MUC_NAV = [
  { den: '/', nhan: 'Trang chủ' },
  { den: '/tim-kiem', nhan: 'Tìm kiếm' },
  { den: '/ke-hoach', nhan: 'Kế hoạch' },
  { den: '/di-cho', nhan: 'Đi chợ' },
  { den: '/ho-so', nhan: 'Hồ sơ' },
];

// BR-UI: Header Stitch — logo + nav pill + nút Đăng công thức + avatar
export function UserLayout() {
  const navigate = useNavigate();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-bep-nha.png" alt="Bếp Nhà" className="h-9 w-9 rounded-xl object-cover" />
            <span className="font-serif text-xl font-black tracking-tight text-ink">Bếp Nhà</span>
          </Link>
          <nav className="mx-auto hidden items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm md:flex">
            {MUC_NAV.map(({ den, nhan }) => (
              <NavLink
                key={den}
                to={den}
                end={den === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-semibold ${
                    isActive ? 'bg-accent-light text-ink' : 'text-slate-500'
                  }`
                }
              >
                {nhan}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <button
              type="button"
              onClick={() => navigate('/cong-thuc/moi')}
              className="flex items-center gap-1 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng công thức</span>
            </button>
            <button
              type="button"
              aria-label="Hồ sơ"
              onClick={() => navigate(nguoiDung ? '/ho-so' : '/dang-nhap')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-base font-bold text-ink"
            >
              {nguoiDung ? nguoiDung.tenHienThi.trim().charAt(0).toUpperCase() : '?'}
            </button>
          </div>
        </div>
        <nav className="flex items-center justify-around border-t border-slate-200/60 bg-white px-2 py-2 md:hidden">
          {MUC_NAV.map(({ den, nhan }) => (
            <NavLink
              key={den}
              to={den}
              end={den === '/'}
              className={({ isActive }) =>
                `px-2 py-1 text-xs font-semibold ${isActive ? 'text-deepteal' : 'text-muted'}`
              }
            >
              {nhan}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 md:flex-row">
          <span className="flex items-center gap-2 font-serif font-black text-ink">
            <img src="/logo-bep-nha.png" alt="" className="h-6 w-6 rounded-lg object-cover" />
            Bếp Nhà
          </span>
          <span>Tinh hoa ẩm thực Việt Nam — Giữ lửa ấm gian bếp mọi nhà.</span>
          <span className="flex gap-4">
            <Link to="/dieu-khoan">Điều khoản</Link>
            <Link to="/bao-mat">Bảo mật</Link>
            <Link to="/lien-he">Liên hệ</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
