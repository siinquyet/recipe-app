import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { TrangDangTai, TrangLoi } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TheCongThuc, layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import { layDanhSachCongThucUser } from '../../api/congThuc';
import { useAuthStore } from '../../stores/authStore';

const NHOM_BUA = ['Tất cả món ngon', 'Bữa sáng thanh đạm', 'Bữa trưa văn phòng', 'Bữa tối quây quần'] as const;

// BR-UI: Trang chủ mẫu Stitch — hero editorial + card navy + lưới nổi bật
export function TrangChu() {
  const navigate = useNavigate();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [nhomChon, setNhomChon] = useState(0);
  const [tuKhoa, setTuKhoa] = useState('');

  const noiBat = useQuery({
    queryKey: ['user', 'recipes', 'noi-bat'],
    queryFn: () => layDanhSachCongThucUser({ trang: 0, kichThuoc: 5 }),
  });
  const phoBien = useQuery({
    queryKey: ['user', 'recipes', 'pho-bien'],
    queryFn: () => layDanhSachCongThucUser({ trang: 0, kichThuoc: 6 }),
  });

  const hero = noiBat.data?.noiDung[0];
  const spotlight = phoBien.data?.noiDung[0];
  const heroAnh = layUrlAnhWeb(hero?.anhThumbnail);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
        <div>
          <CaptionText dam>Mùa hè Hà Nội • 24°C</CaptionText>
          <h1 className="mt-1 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">
            Chào buổi sáng, {nguoiDung?.tenHienThi ?? 'Bạn'}
          </h1>
          <p className="mt-2 max-w-xl text-left text-sm text-slate-500">
            Hôm nay bạn muốn nấu món gì ấm cùng gia đình và những người thân yêu?
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm">
            <strong className="font-serif text-lg text-ink"><NumberDisplay value={phoBien.data?.tongSoPhanTu ?? 0} /></strong> công thức
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <CaptionText dam>Gợi ý chuyên gia dinh dưỡng</CaptionText>
          <h2 className="mt-2 font-serif text-3xl font-black leading-tight tracking-tight text-ink md:text-4xl">
            Vị ngọt thanh hòa quyện cùng hơi khói cay nồng từ gian bếp đất nung truyền thống.
          </h2>
          <p className="mt-3 max-w-lg text-left text-sm leading-6 text-slate-500">
            Mỗi mâm cơm nhà là câu chuyện gìn giữ ngọn lửa ấm. Khám phá hàng nghìn công thức
            gia truyền chuẩn vị ba miền Bắc • Trung • Nam.
          </p>
          <form
            className="mt-4 flex items-center gap-2 rounded-xl border border-slate-300/60 bg-white px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/tim-kiem?tuKhoa=${encodeURIComponent(tuKhoa.trim())}`);
            }}
          >
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-muted" />
            <input
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder="Tìm theo món, nguyên liệu (thịt ba chỉ, ớt khô, cá lóc...)"
              aria-label="Tìm món ăn"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
            <button type="submit" className="shrink-0 rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-white">
              Tìm kiếm
            </button>
          </form>
        </div>

        {hero ? (
          <Link to={`/cong-thuc/${hero.id}`} aria-label={hero.ten} className="relative block overflow-hidden rounded-40px bg-ink text-white shadow-magazine">
            {heroAnh ? (
              <img src={heroAnh} alt={hero.ten} className="h-72 w-full object-cover md:h-80" />
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-ink md:h-80">
                <span className="font-serif text-6xl font-black text-cream">
                  {hero.ten.trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
              <HeartIcon className="h-5 w-5 text-ink" />
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">
              <p className="font-serif text-2xl font-black">{hero.ten}</p>
              <div className="mt-2 flex gap-2 text-center text-xs">
                <span className="rounded-xl bg-white/15 px-3 py-1.5">
                  <NumberDisplay value={hero.thoiGianNauPhut} unit="phút" />
                </span>
                {hero.dinhDuong ? (
                  <span className="rounded-xl bg-white/15 px-3 py-1.5">
                    <NumberDisplay value={hero.dinhDuong.calo} unit="kcal" />
                  </span>
                ) : null}
                <span className="rounded-xl bg-white/15 px-3 py-1.5">
                  <NumberDisplay value={hero.khauPhan} unit="người" />
                </span>
              </div>
              <p className="mt-2 text-left text-xs text-white/80">
                Bếp • {hero.tacGia.tenHienThi}
              </p>
            </div>
          </Link>
        ) : null}
      </div>

      <p className="mt-8 text-left text-sm font-semibold text-ink">Chọn thực đơn theo bữa</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {NHOM_BUA.map((nhom, i) => (
          <button
            key={nhom}
            type="button"
            onClick={() => setNhomChon(i)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              nhomChon === i ? 'bg-accent text-ink' : 'bg-white text-slate-500 shadow-sm'
            }`}
          >
            {nhom}
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <CaptionText dam>Tuyển tập tiêu biểu</CaptionText>
          <h2 className="font-serif text-3xl font-black tracking-tight text-ink">Món Nổi Bật Hôm Nay</h2>
        </div>
      </div>
      {noiBat.isLoading ? (
        <TrangDangTai />
      ) : noiBat.isError || !noiBat.data ? (
        <TrangLoi loi="[REC-01] Không tải được danh sách" khiThuLai={() => noiBat.refetch()} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {noiBat.data.noiDung.map((ct) => (
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
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                  <HeartIcon className="h-4 w-4 text-ink" />
                </span>
              </Link>
              <p className="mt-3 text-left text-xs text-muted">
                <NumberDisplay value={ct.thoiGianNauPhut} unit="phút" /> • <NumberDisplay value={ct.khauPhan} unit="người" />
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

      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-3xl bg-accent-light/50 p-5 md:flex-row">
        <p className="text-left font-serif text-lg font-bold text-ink">
          Bạn còn nguyên liệu gì trong tủ lạnh?
          <span className="block font-sans text-sm font-normal text-slate-500">
            Nhập nguyên liệu có sẵn, Bếp Nhà tự gợi ý thực đơn vừa vặn cho cả nhà.
          </span>
        </p>
        <button
          type="button"
          onClick={() => navigate('/tim-kiem')}
          className="shrink-0 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Gợi ý theo nguyên liệu
        </button>
      </div>

      <div className="mt-8">
        <CaptionText dam>Xu hướng tuần này</CaptionText>
        <h2 className="font-serif text-3xl font-black tracking-tight text-ink">Công thức phổ biến trong tuần</h2>
        {phoBien.isLoading ? (
          <TrangDangTai />
        ) : phoBien.isError || !phoBien.data ? (
          <TrangLoi loi="[REC-01] Không tải được danh sách" khiThuLai={() => phoBien.refetch()} />
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {spotlight ? (
              <article className="rounded-40px bg-white p-5 shadow-magazine">
                <Link to={`/cong-thuc/${spotlight.id}`} className="block overflow-hidden rounded-3xl">
                  {layUrlAnhWeb(spotlight.anhThumbnail) ? (
                    <img src={layUrlAnhWeb(spotlight.anhThumbnail)} alt={spotlight.ten} className="h-64 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-cream">
                      <span className="font-serif text-6xl font-black text-accent-dark">
                        {spotlight.ten.trim().charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>
                <Link to={`/cong-thuc/${spotlight.id}`} className="mt-3 block text-left font-serif text-2xl font-bold text-ink">
                  {spotlight.ten}
                </Link>
                {spotlight.moTa ? (
                  <p className="mt-1 line-clamp-2 text-left text-sm text-slate-500">{spotlight.moTa}</p>
                ) : null}
              </article>
            ) : null}
            <div className="flex flex-col gap-3">
              {(phoBien.data?.noiDung.slice(1, 4) ?? []).map((ct) => (
                <TheCongThuc key={ct.id} duLieu={ct} bienThe="large" />
              ))}
            </div>
          </div>
        )}
      </div>

      <figure className="mt-10 rounded-40px bg-white p-6 text-center shadow-magazine md:p-10">
        <CaptionText dam canLe="giua">Gìn giữ hương vị cội nguồn</CaptionText>
        <blockquote className="mx-auto mt-2 max-w-2xl font-serif text-2xl font-bold leading-snug text-ink md:text-3xl">
          “Nấu ăn không chỉ là nêm nếm gia vị, mà là nêm cả sự chăm chút và tình yêu vào từng
          bữa cơm gia đình.”
        </blockquote>
      </figure>
    </div>
  );
}
