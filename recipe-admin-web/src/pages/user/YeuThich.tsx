import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import { layCongThucTuongTuUser, layDanhSachYeuThichUser } from '../../api/congThuc';

// BR-SOC: Món đã lưu + tìm trong đã lưu + gợi ý thật từ món đầu tiên
export function YeuThich() {
  const [tuKhoa, setTuKhoa] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', 'favorites'],
    queryFn: () => layDanhSachYeuThichUser(0, 50),
  });

  const ds = useMemo(() => {
    const all = data?.noiDung ?? [];
    const tk = tuKhoa.trim().toLowerCase();
    return tk ? all.filter((ct) => ct.ten.toLowerCase().includes(tk)) : all;
  }, [data, tuKhoa]);

  const goiY = useQuery({
    queryKey: ['user', 'favorites', 'goi-y', ds[0]?.id],
    queryFn: () => layCongThucTuongTuUser(ds[0]?.id ?? ''),
    enabled: !!ds[0]?.id,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <Link to="/ho-so" className="hover:underline">Hồ sơ</Link>
        {' / '}
        <span className="font-semibold text-ink">Món ăn yêu thích</span>
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">Sổ tay món ngon gia đình</p>
          <h1 className="mt-1 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">Món Ăn Yêu Thích</h1>
          <p className="mt-2 max-w-xl text-left text-sm text-slate-500">
            Nơi cất giữ những hương vị bạn muốn nấu lại cho mâm cơm sum vầy.
          </p>
        </div>
        <Link to="/ke-hoach" className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white">
          Lên kế hoạch tuần
        </Link>
      </div>

      {isLoading ? (
        <TrangDangTai />
      ) : isError ? (
        <TrangLoi loi="[SOC-01] Không tải được danh sách yêu thích" khiThuLai={() => refetch()} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Món đã lưu trữ</p>
              <p className="mt-1 font-serif text-3xl font-black text-ink">
                <NumberDisplay value={data?.tongSoPhanTu ?? 0} unit="món" />
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Đang hiển thị</p>
              <p className="mt-1 font-serif text-3xl font-black text-ink">
                <NumberDisplay value={ds.length} unit="món" />
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-muted" />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm món đã lưu theo tên..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          {ds.length === 0 ? (
            <TrangTrong nhan={tuKhoa ? `Không có món lưu nào tên "${tuKhoa}"` : 'Bạn chưa yêu thích món nào — bấm tim ở món ăn để lưu lại'} />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ds.map((ct) => (
                <article key={ct.id} className="rounded-40px bg-white p-4 shadow-magazine">
                  <Link to={`/cong-thuc/${ct.id}`} aria-label={ct.ten} className="block overflow-hidden rounded-3xl">
                    {layUrlAnhWeb(ct.anhThumbnail) ? (
                      <img src={layUrlAnhWeb(ct.anhThumbnail)} alt={ct.ten} className="h-52 w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-cream">
                        <span className="font-serif text-5xl font-black text-accent-dark">
                          {ct.ten.trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <p className="mt-3 text-left text-xs text-muted">
                    <NumberDisplay value={ct.thoiGianNauPhut} unit="phút" /> •{' '}
                    <NumberDisplay value={ct.khauPhan} unit="người" />
                    {ct.dinhDuong ? (
                      <>
                        {' '}• <NumberDisplay value={ct.dinhDuong.calo} unit="kcal" />
                      </>
                    ) : null}
                  </p>
                  <Link to={`/cong-thuc/${ct.id}`} className="mt-1 block text-left font-serif text-xl font-bold text-ink">
                    {ct.ten}
                  </Link>
                  <p className="mt-1 text-left text-xs text-muted">Công thức bởi {ct.tacGia.tenHienThi}</p>
                </article>
              ))}
            </div>
          )}

          {(goiY.data?.noiDung.length ?? 0) > 0 ? (
            <div className="mt-10">
              <CaptionText dam>Gợi ý từ Bếp Nhà</CaptionText>
              <h2 className="font-serif text-3xl font-black tracking-tight text-ink">Hợp khẩu vị của bạn</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(goiY.data?.noiDung ?? []).slice(0, 4).map((ct) => (
                  <Link key={ct.id} to={`/cong-thuc/${ct.id}`} className="rounded-3xl bg-white p-3 shadow-sm">
                    {layUrlAnhWeb(ct.anhThumbnail) ? (
                      <img src={layUrlAnhWeb(ct.anhThumbnail)} alt={ct.ten} className="h-32 w-full rounded-2xl object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-cream">
                        <span className="font-serif text-3xl font-black text-accent-dark">
                          {ct.ten.trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="mt-2 truncate text-left text-sm font-semibold text-ink">{ct.ten}</p>
                    <p className="text-left text-xs text-muted">
                      <NumberDisplay value={ct.thoiGianNauPhut} unit="phút" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
