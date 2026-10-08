import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatVn } from '@cook/shared';
import { dangXuatAdmin, layBaiChoDuyet } from '../api/admin';

const MUC_ADMIN = [
  { den: '/admin', nhan: 'Tổng quan', het: true },
  { den: '/admin/cho-duyet', nhan: 'Chờ duyệt', het: false, badge: true },
  { den: '/admin/to-cao', nhan: 'Tố cáo', het: false },
  { den: '/admin/cong-thuc', nhan: 'Công thức', het: false },
  { den: '/admin/danh-muc', nhan: 'Danh mục', het: false },
  { den: '/admin/nguoi-dung', nhan: 'Người dùng', het: false },
  { den: '/admin/nhat-ky', nhan: 'Nhật ký', het: false },
];

// BR-ADM: Khung quản trị — sidebar điều hướng + badge chờ duyệt + nút đăng xuất
export function AdminLayout() {
  const navigate = useNavigate();
  // BR-ADM: Badge số bài chờ duyệt trên nav để không bỏ sót
  const choDuyet = useQuery({
    queryKey: ['admin', 'cho-duyet-dem'],
    queryFn: () => layBaiChoDuyet(0, 1),
    refetchInterval: 60_000,
  });

  const thoat = () => {
    dangXuatAdmin();
    navigate('/admin/dang-nhap');
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="font-serif text-lg font-black tracking-tight">Bếp Nhà · Quản trị</span>
          <span className="rounded-full bg-accent-light/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent-light">
            Editorial
          </span>
          <button
            type="button"
            onClick={thoat}
            className="ml-auto rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <nav className="flex w-48 shrink-0 flex-col gap-1 rounded-40px bg-white p-3 shadow-magazine">
          {MUC_ADMIN.map(({ den, nhan, het, badge }) => (
            <NavLink
              key={den}
              to={den}
              end={het}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                  isActive ? 'bg-ink text-white' : 'text-slate-600 hover:bg-mist'
                }`
              }
            >
              <span>{nhan}</span>
              {badge && (choDuyet.data?.tongSoPhanTu ?? 0) > 0 ? (
                <span className="number-vn rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                  {formatVn(choDuyet.data?.tongSoPhanTu ?? 0)}
                </span>
              ) : null}
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
