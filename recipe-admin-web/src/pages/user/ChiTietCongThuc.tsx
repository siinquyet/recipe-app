import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  baoCaoViPham,
  danhGiaCongThucUser,
  forkCongThucUser,
  layBanCaNhanUser,
  layBinhLuanUser,
  layChiTietCongThucUser,
  layCongThucTuongTuUser,
  layDanhSachYeuThichUser,
  layPhanHoiUser,
  layTomTatDanhGiaUser,
  suaBinhLuanUser,
  taoBinhLuanUser,
  themYeuThichUser,
  xoaBinhLuanUser,
  xoaYeuThichUser,
  type BinhLuan,
} from '../../api/congThuc';
import { themMonVaoKeHoach } from '../../api/keHoachAn';
import { taoDiChoTuCongThuc } from '../../api/diCho';
import { xoaBinhLuanAdmin } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const CAC_TAB = ['Nguyên liệu chuẩn bị', 'Các bước thực hiện'] as const;
const CAC_BUOI = [
  { ma: 'BREAKFAST', nhan: 'Bữa Sáng' },
  { ma: 'LUNCH', nhan: 'Bữa Trưa' },
  { ma: 'DINNER', nhan: 'Bữa Tối' },
  { ma: 'SNACK', nhan: 'Ăn nhẹ' },
] as const;

function laAdmin(): boolean {
  return !!localStorage.getItem('admin_access_token');
}

// BR-SOC: Một bình luận tương tác được — trả lời, xem phản hồi, sửa/xóa của mình
function TheBinhLuan({
  recipeId,
  bl,
  laCuaToi,
  laQuanTri,
}: {
  recipeId: string;
  bl: BinhLuan;
  laCuaToi: boolean;
  laQuanTri: boolean;
}) {
  const queryClient = useQueryClient();
  const [moReplies, setMoReplies] = useState(false);
  const [dangTraLoi, setDangTraLoi] = useState(false);
  const [noiDungTraLoi, setNoiDungTraLoi] = useState('');
  const [dangSua, setDangSua] = useState(false);
  const [noiDungSua, setNoiDungSua] = useState(bl.noiDung);
  const khoaBinhLuan = ['user', 'recipe', recipeId, 'binh-luan'];

  const replies = useQuery({
    queryKey: [...khoaBinhLuan, 'phan-hoi', moReplies ? bl.id : ''],
    queryFn: () => layPhanHoiUser(recipeId, bl.id),
    enabled: moReplies,
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: khoaBinhLuan });
    queryClient.invalidateQueries({ queryKey: [...khoaBinhLuan, 'phan-hoi', bl.id] });
  };
  const traLoi = useMutation({
    mutationFn: () => taoBinhLuanUser(recipeId, noiDungTraLoi.trim(), bl.id),
    onSuccess: () => {
      setNoiDungTraLoi('');
      setDangTraLoi(false);
      setMoReplies(true);
      lamMoi();
    },
    onError: () => alert('Cần đăng nhập để trả lời'),
  });
  const sua = useMutation({
    mutationFn: () => suaBinhLuanUser(recipeId, bl.id, noiDungSua.trim()),
    onSuccess: () => {
      setDangSua(false);
      lamMoi();
    },
  });
  const xoa = useMutation({
    mutationFn: () => xoaBinhLuanUser(recipeId, bl.id),
    onSuccess: lamMoi,
  });
  const xoaAdmin = useMutation({
    mutationFn: () => xoaBinhLuanAdmin(bl.id),
    onSuccess: lamMoi,
    onError: () => alert('[ADM-01] Cần quyền quản trị'),
  });
  const baoCao = useMutation({
    mutationFn: () => baoCaoViPham({ commentId: bl.id, reason: 'INAPPROPRIATE' }),
    onSuccess: () => alert('Đã gửi báo cáo, cảm ơn bạn!'),
    onError: () => alert('Cần đăng nhập để báo cáo'),
  });

  return (
    <li className="border-t border-slate-100 py-3">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-ink">
          {bl.tacGia.tenHienThi.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-left text-sm font-semibold text-ink">
            {bl.tacGia.tenHienThi}{' '}
            <span className="font-normal text-muted">• {format(new Date(bl.thoiGianTao), 'dd/MM/yyyy')}</span>
          </p>
          {dangSua ? (
            <div className="mt-1 flex gap-2">
              <input
                value={noiDungSua}
                onChange={(e) => setNoiDungSua(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
              />
              <NutBam
                tieuDe="Lưu"
                dangTai={sua.isPending}
                voHieuHoa={!noiDungSua.trim()}
                khiBam={() => sua.mutate()}
                className="shrink-0"
              />
              <NutBam tieuDe="Hủy" bienThe="mo" khiBam={() => setDangSua(false)} className="shrink-0" />
            </div>
          ) : (
            <p className="mt-1 text-left text-sm text-ink">{bl.noiDung}</p>
          )}
          <p className="mt-1 flex flex-wrap gap-3 text-xs">
            <button type="button" onClick={() => setDangTraLoi((v) => !v)} className="font-semibold text-deepteal">
              Trả lời
            </button>
            {bl.soLuongPhanHoi > 0 ? (
              <button type="button" onClick={() => setMoReplies((v) => !v)} className="text-muted">
                {moReplies ? 'Ẩn' : 'Xem'} {bl.soLuongPhanHoi} phản hồi
              </button>
            ) : null}
            {laCuaToi ? (
              <>
                <button type="button" onClick={() => setDangSua((v) => !v)} className="font-semibold text-deepteal">
                  Sửa
                </button>
                <button
                  type="button"
                  disabled={xoa.isPending}
                  onClick={() => xoa.mutate()}
                  className="font-semibold text-red-600 disabled:opacity-50"
                >
                  Xóa
                </button>
              </>
            ) : null}
            {laQuanTri && !laCuaToi ? (
              <button
                type="button"
                disabled={xoaAdmin.isPending}
                onClick={() => xoaAdmin.mutate()}
                className="font-semibold text-red-600 disabled:opacity-50"
              >
                Xóa (quản trị)
              </button>
            ) : null}
            {!laCuaToi ? (
              <button type="button" onClick={() => baoCao.mutate()} className="text-muted">
                Báo cáo
              </button>
            ) : null}
          </p>
          {dangTraLoi ? (
            <div className="mt-2 flex gap-2">
              <input
                value={noiDungTraLoi}
                onChange={(e) => setNoiDungTraLoi(e.target.value)}
                placeholder={`Trả lời ${bl.tacGia.tenHienThi}...`}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
              />
              <NutBam
                tieuDe="Gửi"
                dangTai={traLoi.isPending}
                voHieuHoa={!noiDungTraLoi.trim()}
                khiBam={() => traLoi.mutate()}
                className="shrink-0"
              />
            </div>
          ) : null}
          {moReplies
            ? (replies.data?.noiDung ?? []).map((tl) => (
                <div key={tl.id} className="ml-2 mt-2 border-l-2 border-slate-200 pl-3">
                  <p className="text-left text-sm font-semibold text-ink">
                    {tl.tacGia.tenHienThi}{' '}
                    <span className="font-normal text-muted">• {format(new Date(tl.thoiGianTao), 'dd/MM/yyyy')}</span>
                  </p>
                  <p className="mt-0.5 text-left text-sm text-ink">{tl.noiDung}</p>
                </div>
              ))
            : null}
        </div>
      </div>
    </li>
  );
}

// BR-REC + BR-SOC: Chi tiết mẫu Stitch — scale khẩu phần client, tim/sao/bình luận API thật
export function ChiTietCongThuc() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [tab, setTab] = useState<(typeof CAC_TAB)[number]>(CAC_TAB[0]);
  const [khauPhanChon, setKhauPhanChon] = useState<number | null>(() => {
    // BR-04: Mở lại đúng khẩu phần cá nhân đã lưu
    try {
      const v = id ? Number(localStorage.getItem(`canhan:${id}`)) : NaN;
      return Number.isFinite(v) && v >= 1 ? v : null;
    } catch {
      return null;
    }
  });
  const [daChuanBi, setDaChuanBi] = useState<Record<string, boolean>>({});
  const [diem, setDiem] = useState(0);
  const [binhLuan, setBinhLuan] = useState('');
  // BR-MEAL/BR-SHOP: Thêm vào kế hoạch + đi chợ (chứ không báo chưa hỗ trợ)
  const [keHoachChon, setKeHoachChon] = useState('');
  const [ngayAn, setNgayAn] = useState(() => new Date().toISOString().slice(0, 10));
  const [buoiAn, setBuoiAn] = useState<string>('LUNCH');

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
  const tomTat = useQuery({
    queryKey: ['user', 'recipe', id, 'danh-gia'],
    queryFn: () => layTomTatDanhGiaUser(id ?? ''),
    enabled: !!id,
  });
  const dsKeHoach = useQuery({
    queryKey: ['user', 'meal-plans'],
    queryFn: () => import('../../api/keHoachAn').then((m) => m.layDanhSachKeHoachAn(0, 20)),
    enabled: !!nguoiDung,
  });

  // BR-SOC: Trạng thái lưu thật từ /favorites (API chưa trả cờ nên tra danh sách đã lưu)
  const dsLuu = useQuery({
    queryKey: ['user', 'favorites', 'ids'],
    queryFn: () => layDanhSachYeuThichUser(0, 100),
    enabled: !!nguoiDung,
  });
  const yeuThich = (dsLuu.data?.noiDung ?? []).some((ct) => ct.id === id);

  // BR-FORK: Bản riêng tư của mình từ món này (có thì xem, chưa thì fork 1 chạm)
  const banCaNhan = useQuery({
    queryKey: ['user', 'recipe', id, 'ban-ca-nhan'],
    queryFn: () => layBanCaNhanUser(id ?? ''),
    enabled: !!id && !!nguoiDung,
  });
  const forkBanRieng = useMutation({
    mutationFn: () => forkCongThucUser(id ?? ''),
    onSuccess: (banFork) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'recipe', id, 'ban-ca-nhan'] });
      navigate(`/cong-thuc/${banFork.id}`);
    },
    onError: () => alert('[REC-04] Chỉ fork được món cộng đồng đã duyệt'),
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'recipe', id, 'danh-gia'] });
      alert('Cảm ơn bạn đã chấm điểm!');
    },
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
  const luuVaoKeHoach = useMutation({
    mutationFn: () => themMonVaoKeHoach(keHoachChon, { congThucId: id ?? '', ngay: ngayAn, buoiAn, khauPhan: khauPhanHien }),
    onSuccess: () => alert('Đã thêm vào kế hoạch!'),
    onError: (e) => alert(e instanceof Error ? e.message : '[MEAL-01] Không thêm được'),
  });
  const themVaoGio = useMutation({
    mutationFn: () => taoDiChoTuCongThuc(id ?? '', khauPhanHien),
    onSuccess: (ds) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'shopping'] });
      alert(`Đã tạo "${ds.ten}" — sang Đi chợ để xem!`);
    },
    onError: () => alert('[SHOP-01] Cần đăng nhập để tạo danh sách'),
  });
  const baoCaoBai = useMutation({
    mutationFn: () => baoCaoViPham({ recipeId: id, reason: 'INAPPROPRIATE' }),
    onSuccess: () => alert('Đã gửi báo cáo, cảm ơn bạn!'),
    onError: () => alert('Cần đăng nhập để báo cáo'),
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
  const phanBo = tomTat.data?.phanBo ?? {};
  const tongCham = tomTat.data?.tongSoDanhGia ?? 0;

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
          {!nguoiDung || nguoiDung.id !== ct.tacGia.id ? (
            <button
              type="button"
              onClick={() => baoCaoBai.mutate()}
              className="rounded-full px-4 py-2 text-sm text-muted"
            >
              Báo cáo
            </button>
          ) : null}
          {nguoiDung && nguoiDung.id !== ct.tacGia.id ? (
            banCaNhan.data ? (
              <Link
                to={`/cong-thuc/${banCaNhan.data.id}`}
                className="rounded-full bg-accent-light/60 px-4 py-2 text-sm font-semibold text-ink"
              >
                Xem bản của tôi
              </Link>
            ) : (
              <button
                type="button"
                disabled={forkBanRieng.isPending}
                onClick={() => forkBanRieng.mutate()}
                className="rounded-full bg-accent-light/60 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
              >
                Sửa theo ý tôi
              </button>
            )
          ) : null}
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
              Cá nhân hóa khẩu phần
              <select
                value={khauPhanHien}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setKhauPhanChon(v);
                  // BR-04: Nhớ khẩu phần riêng từng món để lần sau + đi chợ dùng đúng
                  try {
                    localStorage.setItem(`canhan:${id}`, String(v));
                  } catch {
                    /* bỏ qua */
                  }
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-ink"
              >
                {[1, 2, 4, 6, 8].map((k) => (
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
          <CaptionText>Chọn kế hoạch, ngày và buổi dùng món này</CaptionText>
          <select
            value={keHoachChon}
            onChange={(e) => setKeHoachChon(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            aria-label="Chọn kế hoạch"
          >
            <option value="">-- Chọn kế hoạch --</option>
            {(dsKeHoach.data?.noiDung ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.ten}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              type="date"
              value={ngayAn}
              onChange={(e) => setNgayAn(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              aria-label="Ngày ăn"
            />
            <select
              value={buoiAn}
              onChange={(e) => setBuoiAn(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              aria-label="Buổi ăn"
            >
              {CAC_BUOI.map((b) => (
                <option key={b.ma} value={b.ma}>
                  {b.nhan}
                </option>
              ))}
            </select>
          </div>
          <NutBam
            tieuDe="Thêm vào kế hoạch tuần"
            className="mt-3 w-full"
            dangTai={luuVaoKeHoach.isPending}
            voHieuHoa={!keHoachChon}
            khiBam={() => luuVaoKeHoach.mutate()}
          />
          <NutBam
            tieuDe="Thêm nguyên liệu vào Đi chợ"
            bienThe="phu"
            className="mt-2 w-full"
            dangTai={themVaoGio.isPending}
            khiBam={() => themVaoGio.mutate()}
          />
          <Link to="/ke-hoach" className="mt-3 flex items-center gap-1 text-sm font-semibold text-deepteal">
            <ChevronLeftIcon className="h-4 w-4 rotate-180" /> Xem kế hoạch tuần
          </Link>
        </aside>
      </div>

      <div className="mt-8 rounded-40px bg-white p-5 shadow-magazine md:p-8">
        <h2 className="font-serif text-2xl font-black text-ink">Nhận xét của bạn đọc</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-mist p-4">
          <div className="text-center">
            <p className="font-serif text-3xl font-black text-ink">
              {tongCham > 0 ? tomTat.data?.diemTrungBinh : '—'}
            </p>
            <CaptionText>{tongCham} lượt chấm</CaptionText>
          </div>
          <div className="min-w-40 flex-1">
            {[5, 4, 3, 2, 1].map((sao) => {
              const so = Number(phanBo[String(sao)] ?? 0);
              const tyLe = tongCham > 0 ? Math.round((so / tongCham) * 100) : 0;
              return (
                <p key={sao} className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-6 text-right font-semibold">{sao}★</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                    <span className="block h-full rounded-full bg-stargold" style={{ width: `${tyLe}%` }} />
                  </span>
                  <span className="w-6">{so}</span>
                </p>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
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
            <NutBam tieuDe="Gửi điểm" bienThe="vien" khiBam={() => diem > 0 && guiDiem.mutate()} dangTai={guiDiem.isPending} voHieuHoa={diem === 0} />
          </div>
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
          <NutBam tieuDe="Gửi" loai="submit" className="shrink-0" dangTai={guiBinhLuan.isPending} voHieuHoa={!binhLuan.trim()} />
        </form>
        <ul className="mt-4">
          {(binhLuans.data?.noiDung ?? []).map((bl) => (
            <TheBinhLuan
              key={bl.id}
              recipeId={id ?? ''}
              bl={bl}
              laCuaToi={nguoiDung?.id === bl.tacGia.id}
              laQuanTri={laAdmin()}
            />
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
