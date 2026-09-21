import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import { layDanhSachCongThucUser } from '../../api/congThuc';
import { useAuthStore } from '../../stores/authStore';

// BR-UREC: Món APPROVED của tôi (backend hiện chỉ trả APPROVED) — tìm + sắp xếp trong trang
export function CongThucCuaToi() {
  const navigate = useNavigate();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [tuKhoa, setTuKhoa] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', 'recipes', 'cua-toi', nguoiDung?.id],
    queryFn: () => layDanhSachCongThucUser({ trang: 0, kichThuoc: 50, tacGiaId: nguoiDung?.id }),
    enabled: !!nguoiDung?.id,
  });

  const ds = useMemo(() => {
    const all = data?.noiDung ?? [];
    const tk = tuKhoa.trim().toLowerCase();
    return tk ? all.filter((ct) => ct.ten.toLowerCase().includes(tk)) : all;
  }, [data, tuKhoa]);

  const tongPhut = ds.reduce((s, ct) => s + ct.thoiGianNauPhut, 0);
  const coAnh = ds.filter((ct) => ct.anhThumbnail).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <Link to="/ho-so" className="hover:underline">Hồ sơ</Link>
        {' / '}
        <span className="font-semibold text-ink">Công thức của tôi</span>
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">Sổ tay ẩm thực cá nhân</p>
          <h1 className="mt-1 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">Công thức của tôi</h1>
          <p className="mt-2 max-w-xl text-left text-sm text-slate-500">
            Quản lý các món ngon bạn đã đóng góp cho cộng đồng Bếp Nhà.
          </p>
        </div>
        <NutBam
          tieuDe="Tạo công thức mới"
          khiBam={() => navigate('/cong-thuc/moi')}
          className="[&>span]:flex [&>span]:items-center [&>span]:gap-1"
        />
      </div>

      {!nguoiDung ? (
        <CaptionText className="mt-4">Đăng nhập để xem công thức của bạn</CaptionText>
      ) : isLoading ? (
        <TrangDangTai />
      ) : isError ? (
        <TrangLoi loi="[REC-01] Không tải được danh sách" khiThuLai={() => refetch()} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { nhan: 'Tổng món', giaTri: <NumberDisplay value={ds.length} unit="món" /> },
              { nhan: 'Tổng thời gian nấu', giaTri: <NumberDisplay value={tongPhut} unit="phút" /> },
              { nhan: 'Món có ảnh', giaTri: <NumberDisplay value={coAnh} unit="món" /> },
            ].map((s) => (
              <div key={s.nhan} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{s.nhan}</p>
                <p className="mt-1 font-serif text-2xl font-black text-ink">{s.giaTri}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-muted" />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo tên món..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          {ds.length === 0 ? (
            <TrangTrong nhan={tuKhoa ? `Không có món nào tên "${tuKhoa}"` : 'Bạn chưa có công thức nào — tạo món đầu tiên nhé!'} />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ds.map((ct) => (
                <article key={ct.id} className="rounded-40px bg-white p-4 shadow-magazine">
                  <Link to={`/cong-thuc/${ct.id}`} aria-label={ct.ten} className="block overflow-hidden rounded-3xl">
                    {layUrlAnhWeb(ct.anhThumbnail) ? (
                      <img src={layUrlAnhWeb(ct.anhThumbnail)} alt={ct.ten} className="h-48 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-cream">
                        <span className="font-serif text-5xl font-black text-accent-dark">
                          {ct.ten.trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <p className="mt-3 text-left text-xs text-muted">
                    <NumberDisplay value={ct.thoiGianNauPhut} unit="phút" /> •{' '}
                    <NumberDisplay value={ct.khauPhan} unit="người" />
                  </p>
                  <Link to={`/cong-thuc/${ct.id}`} className="mt-1 block text-left font-serif text-xl font-bold text-ink">
                    {ct.ten}
                  </Link>
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <Link to={`/cong-thuc/${ct.id}`} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-mist py-2 text-sm font-semibold text-ink">
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
