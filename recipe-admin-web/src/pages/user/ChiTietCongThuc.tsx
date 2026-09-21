import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeftIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as TimDac, StarIcon as SaoDac } from '@heroicons/react/24/solid';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { TheCongThuc, layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import {
  danhGiaCongThucUser,
  layBinhLuanUser,
  layChiTietCongThucUser,
  layCongThucTuongTuUser,
  layDanhSachYeuThichUser,
  taoBinhLuanUser,
  themYeuThichUser,
  xoaYeuThichUser,
} from '../../api/congThuc';
import { useAuthStore } from '../../stores/authStore';

const CAC_TAB = ['Nguyên liệu chuẩn bị', 'Các bước thực hiện'] as const;
const CAC_BUA = ['Bữa Sáng', 'Bữa Trưa', 'Bữa Tối'] as const;

// BR-REC + BR-SOC: Chi tiết mẫu Stitch — scale khẩu phần client, tim/sao/bình luận API thật
export function ChiTietCongThuc() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [tab, setTab] = useState<(typeof CAC_TAB)[number]>(CAC_TAB[0]);
  const [khauPhanChon, setKhauPhanChon] = useState<number | null>(null);
  const [daChuanBi, setDaChuanBi] = useState<Record<string, boolean>>({});
  const [buoiChon, setBuoiChon] = useState(1);
  const [diem, setDiem] = useState(0);
  const [binhLuan, setBinhLuan] = useState('');

  const chiTiet = useQuery({
    queryKey: ['user', 'recipe', id],
    queryFn: () => layChiTietCongThucUser(id ?? ''),
    enabled: !!id,
  });
  const tuongTu = useQuery({
    queryKey: ['user', 'recipe', id, 'tuong-tu'],
    queryFn: () => layCongThucTuongTuUser(id ?? ''),
    enabled: !!id,
  });
  const binhLuans = useQuery({
    queryKey: ['user', 'recipe', id, 'binh-luan'],
    queryFn: () => layBinhLuanUser(id ?? ''),
    enabled: !!id,
  });

  // BR-SOC: Trạng thái lưu thật từ /favorites (API chưa trả cờ nên tra danh sách đã lưu)
  const dsLuu = useQuery({
    queryKey: ['user', 'favorites', 'ids'],
    queryFn: () => layDanhSachYeuThichUser(0, 100),
    enabled: !!nguoiDung,
  });
  const yeuThich = (dsLuu.data?.noiDung ?? []).some((ct) => ct.id === id);

  const chuyenTim = useMutation({
    mutationFn: () => (yeuThich ? xoaYeuThichUser(id ?? '') : themYeuThichUser(id ?? '')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
    },
    onError: () =>
      alert(nguoiDung ? '[SOC-01] Không lưu được, thử lại sau' : '[SOC-01] Cần đăng nhập để yêu thích'),
  });
  const guiDiem = useMutation({
    mutationFn: () => danhGiaCongThucUser(id ?? '', diem),
    onSuccess: () => alert('Cảm ơn bạn đã chấm điểm!'),
    onError: () => alert('[SOC-02] Cần đăng nhập để đánh giá'),
  });
  const guiBinhLuan = useMutation({
    mutationFn: () => taoBinhLuanUser(id ?? '', binhLuan.trim()),
    onSuccess: () => {
      setBinhLuan('');
      queryClient.invalidateQueries({ queryKey: ['user', 'recipe', id, 'binh-luan'] });
    },
    onError: () => alert('[SOC-02] Cần đăng nhập để bình luận'),
  });

  if (chiTiet.isLoading) return <TrangDangTai />;
  if (chiTiet.isError || !chiTiet.data)
    return (
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <TrangLoi loi="[REC-04] Không tìm thấy công thức" khiThuLai={() => chiTiet.refetch()} />
      </div>
    );

  const ct = chiTiet.data;
  const anh = layUrlAnhWeb(ct.anhThumbnail);
  const khauPhanGoc = ct.khauPhan || 1;
  const khauPhanHien = khauPhanChon ?? khauPhanGoc;
  // BR-04: Định lượng hiển thị = gốc × (khẩu phần chọn / khẩu phần gốc)
  const dinhLuongHien = (goc: string) => {
    const so = Number(goc);
    if (!Number.isFinite(so)) return goc;
    const kq = (so * khauPhanHien) / khauPhanGoc;
    return Number.isInteger(kq) ? String(kq) : kq.toFixed(1);
  };

  const stats = [
    { nhan: 'Chuẩn bị', giaTri: `${ct.thoiGianChuanBiPhut ?? 0} phút` },
    { nhan: 'Chế biến', giaTri: `${ct.thoiGianNauPhut} phút` },
    { nhan: 'Khẩu phần', giaTri: `${khauPhanHien} người` },
    { nhan: 'Năng lượng', giaTri: ct.dinhDuong ? `${ct.dinhDuong.calo} Kcal` : '—' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <Link to="/tim-kiem" className="hover:underline">Tìm kiếm</Link>
        {' / '}
        <span className="font-semibold text-ink">{ct.ten}</span>
      </p>

      <h1 className="mt-4 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">{ct.ten}</h1>
      {ct.moTa ? <p className="mt-2 max-w-2xl text-left text-sm text-slate-500">{ct.moTa}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-ink">
            {ct.tacGia.tenHienThi.trim().charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-ink">{ct.tacGia.tenHienThi}</span>
          <CaptionText>Đăng ngày {format(new Date(ct.ngayTao), 'dd/MM/yyyy')}</CaptionText>
        </span>
        <span className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => chuyenTim.mutate()}
            className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold ${
              yeuThich ? 'bg-danger/10 text-danger' : 'bg-accent-light/60 text-ink'
            }`}
          >
            {yeuThich ? <TimDac className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
            {yeuThich ? 'Đã lưu' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}
            className="rounded-full bg-accent-light/60 px-4 py-2 text-sm font-semibold text-ink"
          >
            Chia sẻ
          </button>
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-40px shadow-magazine">
        {anh ? (
          <img src={anh} alt={ct.ten} className="h-72 w-full object-cover md:h-96" />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-cream md:h-96">
            <span className="font-serif text-7xl font-black text-accent-dark">
              {ct.ten.trim().charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.nhan} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{s.nhan}</p>
            <p className="mt-1 font-serif text-xl font-black text-ink">{s.giaTri}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-40px bg-white p-5 shadow-magazine md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {CAC_TAB.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  tab === t ? 'bg-ink text-white' : 'bg-mist text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm text-slate-500">
              Khẩu phần
              <select
                value={khauPhanHien}
                onChange={(e) => setKhauPhanChon(Number(e.target.value))}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-ink"
              >
                {[2, 4, 6, 8].map((k) => (
                  <option key={k} value={k}>
                    {k} người
                  </option>
                ))}
              </select>
            </label>
          </div>

          {tab === CAC_TAB[0] ? (
            <ul className="mt-4">
              {ct.nguyenLieu.map((nl) => {
                const xong = !!daChuanBi[nl.ten];
                return (
                  <li key={nl.ten}>
                    <button
                      type="button"
                      onClick={() => setDaChuanBi((cu) => ({ ...cu, [nl.ten]: !cu[nl.ten] }))}
                      className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left"
                    >
                      <span
                        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                          xong ? 'border-accent bg-accent text-white' : 'border-muted'
                        }`}
                      >
                        {xong ? '✓' : ''}
                      </span>
                      <span className={`flex-1 ${xong ? 'text-muted line-through' : 'text-ink'}`}>{nl.ten}</span>
                      <NumberDisplay value={Number(dinhLuongHien(nl.dinhLuong)) || 0} unit={nl.donVi} className="text-sm font-semibold" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ol className="mt-4">
              {ct.cacBuoc.map((buoc) => (
                <li key={buoc.thuTu} className="mt-4 flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light font-serif text-lg font-black text-ink">
                    {buoc.thuTu}
                  </span>
                  <p className="text-left text-sm leading-6 text-ink">{buoc.noiDung}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="h-fit rounded-40px bg-white p-5 shadow-magazine lg:sticky lg:top-24">
          <p className="font-serif text-lg font-bold text-ink">Lên thực đơn bữa cơm</p>
          <CaptionText>Chọn thời gian dùng món này</CaptionText>
          <div className="mt-3 flex gap-2">
            {CAC_BUA.map((b, i) => (
              <button
                key={b}
                type="button"
                onClick={() => setBuoiChon(i)}
                className={`flex-1 rounded-full px-2 py-1.5 text-xs font-semibold ${
                  buoiChon === i ? 'bg-ink text-white' : 'bg-mist text-slate-500'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <NutBam
            tieuDe="Thêm vào kế hoạch tuần"
            className="mt-3 w-full"
            khiBam={() => alert('[MEAL-01] Backend chưa hỗ trợ thêm món vào kế hoạch')}
          />
          <NutBam
            tieuDe="Thêm nguyên liệu vào Đi chợ"
            bienThe="phu"
            className="mt-2 w-full"
            khiBam={() => alert('[SHOP-01] Backend chưa hỗ trợ thêm nguyên liệu lẻ')}
          />
          <Link to="/ke-hoach" className="mt-3 flex items-center gap-1 text-sm font-semibold text-deepteal">
            <ChevronLeftIcon className="h-4 w-4 rotate-180" /> Xem kế hoạch tuần
          </Link>
        </aside>
      </div>

      <div className="mt-8 rounded-40px bg-white p-5 shadow-magazine md:p-8">
        <h2 className="font-serif text-2xl font-black text-ink">Nhận xét của bạn đọc</h2>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-mist p-4">
          <p className="text-sm font-semibold text-ink">Chấm điểm món này:</p>
          <span className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" aria-label={`${s} sao`} onClick={() => setDiem(s)}>
                {s <= diem ? (
                  <SaoDac className="h-6 w-6 text-stargold" />
                ) : (
                  <StarIcon className="h-6 w-6 text-muted" />
                )}
              </button>
            ))}
          </span>
          <NutBam tieuDe="Gửi điểm" bienThe="vien" className="ml-auto" khiBam={() => diem > 0 && guiDiem.mutate()} />
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (binhLuan.trim()) guiBinhLuan.mutate();
          }}
        >
          <input
            value={binhLuan}
            onChange={(e) => setBinhLuan(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn..."
            aria-label="Viết bình luận"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-accent"
          />
          <NutBam tieuDe="Gửi" loai="submit" className="shrink-0" />
        </form>
        <ul className="mt-4">
          {(binhLuans.data?.noiDung ?? []).map((bl) => (
            <li key={bl.id} className="flex gap-3 border-t border-slate-100 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-ink">
                {bl.tacGia.tenHienThi.trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-left text-sm font-semibold text-ink">
                  {bl.tacGia.tenHienThi}{' '}
                  <span className="font-normal text-muted">
                    • {format(new Date(bl.thoiGianTao), 'dd/MM/yyyy')}
                  </span>
                </p>
                <p className="mt-1 text-left text-sm text-ink">{bl.noiDung}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-2xl font-black text-ink">Món ngon dùng kèm hoàn hảo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(tuongTu.data?.noiDung ?? []).slice(0, 3).map((m) => (
            <TheCongThuc key={m.id} duLieu={m} bienThe="grid" />
          ))}
        </div>
      </div>
    </div>
  );
}
