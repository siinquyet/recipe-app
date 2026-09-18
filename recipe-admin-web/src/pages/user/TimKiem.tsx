import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import { layDanhSachCongThucUser } from '../../api/congThuc';

const KICH_THUOC_TRANG = 6;

const MOC_THOI_GIAN = [
  { nhan: 'Dưới 15 phút', toiDa: 15 },
  { nhan: '15 - 30 phút', toiDa: 30 },
  { nhan: '30 - 60 phút', toiDa: 60 },
] as const;

const MOC_KHAU_PHAN = [2, 4, 6] as const;

// BR-REC: Search API + lọc client-side trong trang (backend chưa có diet/diet-time filter)
export function TimKiem() {
  const [thamSoUrl] = useSearchParams();
  const [tuKhoa, setTuKhoa] = useState(thamSoUrl.get('tuKhoa') ?? '');
  const [tuKhoaTre, setTuKhoaTre] = useState(thamSoUrl.get('tuKhoa') ?? '');
  const [trang, setTrang] = useState(0);
  const [gioiHanPhut, setGioiHanPhut] = useState<number | null>(null);
  const [khauPhan, setKhauPhan] = useState<number | null>(null);
  const [sapXep, setSapXep] = useState<'moi' | 'nhanh'>('moi');

  useEffect(() => {
    const henGio = setTimeout(() => {
      setTuKhoaTre(tuKhoa.trim());
      setTrang(0);
    }, 400);
    return () => clearTimeout(henGio);
  }, [tuKhoa]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user', 'recipes', 'tim-kiem', tuKhoaTre, trang],
    queryFn: () =>
      layDanhSachCongThucUser({ trang, kichThuoc: KICH_THUOC_TRANG, tuKhoa: tuKhoaTre || undefined }),
  });

  const ketQuaLoc = useMemo(() => {
    let ds = data?.noiDung ?? [];
    if (gioiHanPhut !== null) ds = ds.filter((ct) => ct.thoiGianNauPhut <= gioiHanPhut);
    if (khauPhan !== null) ds = ds.filter((ct) => ct.khauPhan >= khauPhan);
    if (sapXep === 'nhanh') ds = [...ds].sort((a, b) => a.thoiGianNauPhut - b.thoiGianNauPhut);
    return ds;
  }, [data, gioiHanPhut, khauPhan, sapXep]);

  const goiY = (data?.noiDung ?? []).slice(0, 3);
  const tongTrang = data?.tongSoTrang ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-6 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">
        Kho tàng hương vị thuần Việt
      </p>
      <h1 className="mx-auto mt-2 max-w-2xl text-center font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">
        Hôm nay gian bếp nấu món gì?
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Tìm kiếm cảm hứng bữa cơm sum vầy từ nguyên liệu sẵn có trong tủ lạnh
      </p>

      <div className="relative mx-auto mt-6 max-w-2xl">
        <div className="flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white px-4 py-3.5">
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-muted" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm món ăn, nguyên liệu..."
            aria-label="Tìm món ăn"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          {tuKhoa ? (
            <button type="button" aria-label="Xóa từ khóa" onClick={() => setTuKhoa('')}>
              <XMarkIcon className="h-5 w-5 text-muted" />
            </button>
          ) : null}
        </div>
        {tuKhoaTre && goiY.length > 0 ? (
          <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl bg-white p-2 shadow-magazine">
            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted">
              Gợi ý trực tiếp • {goiY.length} kết quả nhanh
            </p>
            {goiY.map((ct) => (
              <Link
                key={ct.id}
                to={`/cong-thuc/${ct.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-mist"
              >
                <span className="flex-1 truncate text-left text-sm font-medium text-ink">{ct.ten}</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-45 text-muted" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-40px bg-white p-5 shadow-magazine lg:sticky lg:top-24">
          <p className="font-serif text-lg font-bold text-ink">Bộ lọc chuyên sâu</p>
          <p className="mt-3 text-left text-sm font-semibold text-ink">Thời gian chế biến</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOC_THOI_GIAN.map((m) => (
              <button
                key={m.nhan}
                type="button"
                onClick={() => setGioiHanPhut((cu) => (cu === m.toiDa ? null : m.toiDa))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  gioiHanPhut === m.toiDa ? 'bg-deepteal text-white' : 'bg-mist text-slate-500'
                }`}
              >
                {m.nhan}
              </button>
            ))}
          </div>
          <p className="mt-4 text-left text-sm font-semibold text-ink">Khẩu phần phục vụ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOC_KHAU_PHAN.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setKhauPhan((cu) => (cu === m ? null : m))}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  khauPhan === m ? 'bg-deepteal text-white' : 'bg-mist text-slate-500'
                }`}
              >
                {m}+ người
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setGioiHanPhut(null);
                setKhauPhan(null);
              }}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-500"
            >
              Đặt lại
            </button>
            <span className="flex flex-1 items-center px-3 py-2.5 text-xs text-slate-500">
              Bỏ chọn chip để xem tất cả
            </span>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between">
            <CaptionText>
              {isLoading ? 'Đang tìm...' : `Tìm thấy ${data?.tongSoPhanTu ?? 0} món`}
            </CaptionText>
            <select
              value={sapXep}
              onChange={(e) => setSapXep(e.target.value as 'moi' | 'nhanh')}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink"
              aria-label="Sắp xếp"
            >
              <option value="moi">Mới nhất</option>
              <option value="nhanh">Nhanh nhất</option>
            </select>
          </div>

          {isLoading ? (
            <TrangDangTai />
          ) : isError ? (
            <TrangLoi loi="[REC-01] Không tải được kết quả" khiThuLai={() => refetch()} />
          ) : ketQuaLoc.length === 0 ? (
            <TrangTrong nhan={tuKhoaTre ? `Không tìm thấy món "${tuKhoaTre}"` : 'Nhập từ khóa để tìm món ngon'} />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {ketQuaLoc.map((ct) => (
                <article key={ct.id} className="rounded-40px bg-white p-4 shadow-magazine">
                  <Link to={`/cong-thuc/${ct.id}`} aria-label={ct.ten} className="relative block overflow-hidden rounded-3xl">
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
                  {ct.moTa ? (
                    <p className="mt-1 line-clamp-2 text-left text-xs text-slate-500">{ct.moTa}</p>
                  ) : null}
                  <p className="mt-2 text-left text-xs text-muted">Bởi {ct.tacGia.tenHienThi}</p>
                </article>
              ))}
            </div>
          )}

          {tongTrang > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={trang === 0}
                onClick={() => setTrang((t) => Math.max(0, t - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 disabled:opacity-40"
                aria-label="Trang trước"
              >
                ‹
              </button>
              {Array.from({ length: tongTrang }, (_, i) => i)
                .slice(Math.max(0, trang - 1), Math.max(0, trang - 1) + 3)
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrang(t)}
                    className={`h-9 w-9 rounded-full text-sm font-bold ${
                      t === trang ? 'bg-ink text-white' : 'border border-slate-300 text-ink'
                    }`}
                  >
                    {t + 1}
                  </button>
                ))}
              <button
                type="button"
                disabled={trang + 1 >= tongTrang}
                onClick={() => setTrang((t) => t + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 disabled:opacity-40"
                aria-label="Trang sau"
              >
                ›
              </button>
            </div>
          ) : null}
          <p className="mt-3 text-center text-xs text-muted">
            Đang xem {ketQuaLoc.length} trên tổng số {data?.tongSoPhanTu ?? 0} công thức
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-40px bg-deepteal p-6 text-white md:flex-row md:p-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-light">
            Trợ lý đầu bếp Bếp Nhà
          </p>
          <p className="mt-1 font-serif text-2xl font-black md:text-3xl">Chưa tìm được món vừa khẩu vị gia đình?</p>
          <p className="mt-1 max-w-lg text-left text-sm text-white/80">
            Nhập các nguyên liệu bạn đang có sẵn trong gian bếp, chúng tôi sẽ gợi ý ngay thực đơn hoàn hảo hôm nay.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink"
        >
          Tìm lại từ đầu
        </button>
      </div>
    </div>
  );
}
