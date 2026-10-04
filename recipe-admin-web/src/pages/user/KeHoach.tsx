import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import {
  capNhatKeHoachAn,
  capNhatMonTrongKeHoach,
  layChiTietKeHoachAn,
  layDanhSachKeHoachAn,
  taoKeHoachAn,
  themMonVaoKeHoach,
  xoaKeHoachAn,
  xoaMonKhoiKeHoach,
} from '../../api/keHoachAn';
import { layDanhSachCongThucUser, layDanhSachYeuThichUser } from '../../api/congThuc';
import { taoDiChoTuKeHoach } from '../../api/diCho';

const TEN_BUOI: Record<string, string> = {
  BREAKFAST: 'Sáng',
  LUNCH: 'Trưa',
  DINNER: 'Tối',
  SNACK: 'Ăn nhẹ',
};

const CAC_BUOI = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

// BR-UI: Thứ tiếng Việt (date-fns mặc định tiếng Anh nên tự map)
const TEN_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

function kiemTraKhoangNgay(ten: string, batDau: string, ketThuc: string): string {
  if (!ten.trim()) return 'Vui lòng nhập tên kế hoạch';
  if (!batDau.trim() || !ketThuc.trim()) return 'Vui lòng nhập đủ từ ngày và đến ngày';
  const tu = new Date(`${batDau.trim()}T00:00:00`);
  const den = new Date(`${ketThuc.trim()}T00:00:00`);
  if (Number.isNaN(tu.getTime()) || Number.isNaN(den.getTime())) return 'Ngày không hợp lệ (YYYY-MM-DD)';
  if (tu > den) return 'Ngày bắt đầu phải trước ngày kết thúc';
  return '';
}

// BR-MEAL: CRUD kế hoạch + thêm/sửa/xóa món trong tuần
export function KeHoach() {
  const queryClient = useQueryClient();
  const [keHoachChon, setKeHoachChon] = useState('');
  const [dangTao, setDangTao] = useState(false);
  const [ten, setTen] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [loiTao, setLoiTao] = useState('');
  const [dangSua, setDangSua] = useState(false);
  const [suaTen, setSuaTen] = useState('');
  const [suaTuNgay, setSuaTuNgay] = useState('');
  const [suaDenNgay, setSuaDenNgay] = useState('');
  const [loiSua, setLoiSua] = useState('');
  // BR-MEAL: Thêm món — tìm công thức rồi chọn ngày + buổi + khẩu phần
  const [themNgay, setThemNgay] = useState('');
  const [tuKhoaMon, setTuKhoaMon] = useState('');
  const [nguonMon, setNguonMon] = useState<'yeu-thich' | 'cua-toi'>('yeu-thich');
  const [congThucChon, setCongThucChon] = useState('');
  const [buoiChon, setBuoiChon] = useState<string>('LUNCH');
  const [khauPhanMoi, setKhauPhanMoi] = useState(2);
  const [loiThemMon, setLoiThemMon] = useState('');

  const danhSach = useQuery({
    queryKey: ['user', 'meal-plans'],
    queryFn: () => layDanhSachKeHoachAn(0, 20),
  });
  const keHoachId = keHoachChon || danhSach.data?.noiDung[0]?.id || '';
  const chiTiet = useQuery({
    queryKey: ['user', 'meal-plan', keHoachId],
    queryFn: () => layChiTietKeHoachAn(keHoachId),
    enabled: !!keHoachId,
  });
  const goiYMon = useQuery({
    queryKey: ['user', 'recipes', 'goi-y-mon', nguonMon, tuKhoaMon],
    queryFn: () =>
      nguonMon === 'yeu-thich'
        ? layDanhSachYeuThichUser(0, 50)
        : layDanhSachCongThucUser({ trang: 0, kichThuoc: 5, tuKhoa: tuKhoaMon || undefined }),
    enabled: themNgay.length > 0,
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'meal-plans'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'meal-plan'] });
  };
  const taoMoi = useMutation({
    mutationFn: () => taoKeHoachAn({ ten: ten.trim(), ngayBatDau: tuNgay.trim(), ngayKetThuc: denNgay.trim() }),
    onSuccess: (moi) => {
      setTen('');
      setTuNgay('');
      setDenNgay('');
      setDangTao(false);
      setKeHoachChon(moi.id);
      lamMoi();
    },
    onError: () => alert('[MEAL-01] Không tạo được, thử lại'),
  });
  const capNhat = useMutation({
    mutationFn: () =>
      capNhatKeHoachAn(keHoachId, { ten: suaTen.trim(), ngayBatDau: suaTuNgay.trim(), ngayKetThuc: suaDenNgay.trim() }),
    onSuccess: () => {
      setDangSua(false);
      lamMoi();
    },
    onError: () => alert('[MEAL-01] Không sửa được, thử lại'),
  });
  const xoa = useMutation({
    mutationFn: () => xoaKeHoachAn(keHoachId),
    onSuccess: () => {
      setKeHoachChon('');
      lamMoi();
    },
    onError: () => alert('[MEAL-01] Không xóa được, thử lại'),
  });
  const themMon = useMutation({
    mutationFn: () =>
      themMonVaoKeHoach(keHoachId, { congThucId: congThucChon, ngay: themNgay, buoiAn: buoiChon, khauPhan: khauPhanMoi }),
    onSuccess: () => {
      setThemNgay('');
      setCongThucChon('');
      setTuKhoaMon('');
      setKhauPhanMoi(2);
      setLoiThemMon('');
      queryClient.invalidateQueries({ queryKey: ['user', 'meal-plan', keHoachId] });
    },
    // BR-MEAL: Hiện mã thật MEAL-00/06/07 để biết thiếu field, ngoài khoảng hay trùng buổi
    onError: (loi: unknown) => {
      const ma = (loi as { code?: string })?.code;
      const thongDiep = loi instanceof Error ? loi.message : '';
      setLoiThemMon(thongDiep || (ma ? `[${ma}] Không thêm được` : '[MEAL-01] Không thêm được, thử lại'));
    },
  });
  const suaKhauPhan = useMutation({
    mutationFn: ({ monId, khauPhan }: { monId: string; khauPhan: number }) =>
      capNhatMonTrongKeHoach(keHoachId, monId, khauPhan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'meal-plan', keHoachId] }),
    onError: () => alert('[MEAL-01] Không sửa được, thử lại'),
  });
  const xoaMon = useMutation({
    mutationFn: (monId: string) => xoaMonKhoiKeHoach(keHoachId, monId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', 'meal-plan', keHoachId] }),
    onError: () => alert('[MEAL-01] Không xóa được, thử lại'),
  });
  const sinhDiCho = useMutation({
    mutationFn: ({ tuNgay, denNgay }: { tuNgay?: string; denNgay?: string }) =>
      taoDiChoTuKeHoach(keHoachId, tuNgay, denNgay),
    onSuccess: (ds) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'shopping'] });
      alert(`Đã tạo "${ds.ten}" — sang Đi chợ để xem!`);
    },
    onError: () => alert('[SHOP-01] Cần đăng nhập để tạo danh sách'),
  });
  const [diChoTuNgay, setDiChoTuNgay] = useState('');
  const [diChoDenNgay, setDiChoDenNgay] = useState('');

  const ngayTrongTuan = useMemo(() => {
    if (!chiTiet.data) return [];
    const batDau = parseISO(chiTiet.data.ngayBatDau);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(batDau);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [chiTiet.data]);

  const monTheoNgay = (ngayISO: string) =>
    (chiTiet.data?.cacMon ?? []).filter((m) => m.ngay === ngayISO);

  const tongMon = chiTiet.data?.cacMon.length ?? 0;
  const tongKhauPhan = (chiTiet.data?.cacMon ?? []).reduce((s, m) => s + m.khauPhan, 0);

  const luuMoi = () => {
    const loi = kiemTraKhoangNgay(ten, tuNgay, denNgay);
    if (loi) {
      setLoiTao(loi);
      return;
    }
    setLoiTao('');
    taoMoi.mutate();
  };

  const batDauSua = () => {
    if (!chiTiet.data) return;
    setSuaTen(chiTiet.data.ten);
    setSuaTuNgay(chiTiet.data.ngayBatDau);
    setSuaDenNgay(chiTiet.data.ngayKetThuc);
    setLoiSua('');
    setDangSua(true);
  };

  const luuSua = () => {
    const loi = kiemTraKhoangNgay(suaTen, suaTuNgay, suaDenNgay);
    if (loi) {
      setLoiSua(loi);
      return;
    }
    setLoiSua('');
    capNhat.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">
        Kế hoạch tuần & Đi chợ tự động
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">
          Kế hoạch dinh dưỡng tuần này
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={keHoachId}
            onChange={(e) => setKeHoachChon(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
            aria-label="Chọn kế hoạch"
          >
            {(danhSach.data?.noiDung ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.ten}
              </option>
            ))}
          </select>
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="vien" khiBam={() => setDangTao((v) => !v)} />
          <input
            value={diChoTuNgay}
            onChange={(e) => setDiChoTuNgay(e.target.value)}
            placeholder="Từ ngày"
            className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none"
            aria-label="Đi chợ từ ngày"
          />
          <input
            value={diChoDenNgay}
            onChange={(e) => setDiChoDenNgay(e.target.value)}
            placeholder="Đến ngày"
            className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none"
            aria-label="Đi chợ đến ngày"
          />
          <NutBam
            tieuDe="Đi chợ ngày chọn"
            khiBam={() => keHoachId && sinhDiCho.mutate({ tuNgay: diChoTuNgay.trim() || undefined, denNgay: diChoDenNgay.trim() || undefined })}
            dangTai={sinhDiCho.isPending}
          />
          <NutBam tieuDe="Đi chợ cả tuần" bienThe="vien" khiBam={() => keHoachId && sinhDiCho.mutate({})} dangTai={sinhDiCho.isPending} />
        </div>
      </div>

      {dangTao ? (
        <div className="mt-4 max-w-xl rounded-2xl bg-white p-4 shadow-sm">
          <input
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            placeholder="Tên kế hoạch (VD: Tuần 1)"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex gap-2">
            <input
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
              placeholder="Từ ngày (YYYY-MM-DD)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
            <input
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
              placeholder="Đến ngày (YYYY-MM-DD)"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          {loiTao ? <p className="mt-1 text-left text-sm text-red-600">{loiTao}</p> : null}
          <NutBam tieuDe="Lưu kế hoạch" dangTai={taoMoi.isPending} khiBam={luuMoi} className="mt-3" />
        </div>
      ) : null}

      {danhSach.isLoading || chiTiet.isLoading ? (
        <TrangDangTai />
      ) : danhSach.isError || !danhSach.data ? (
        <TrangLoi loi="[MEAL-01] Không tải được kế hoạch" khiThuLai={() => danhSach.refetch()} />
      ) : !chiTiet.data ? (
        <TrangTrong nhan="Bạn chưa có kế hoạch nào trong tuần" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { nhan: 'Tổng món ăn', giaTri: <NumberDisplay value={tongMon} unit="món" /> },
              { nhan: 'Số ngày', giaTri: <NumberDisplay value={ngayTrongTuan.length} unit="ngày" /> },
              { nhan: 'Tổng khẩu phần', giaTri: <NumberDisplay value={tongKhauPhan} unit="phần" /> },
              {
                nhan: 'Từ ngày',
                giaTri: <span className="font-serif text-xl font-black">{format(parseISO(chiTiet.data.ngayBatDau), 'dd/MM')}</span>,
              },
            ].map((s) => (
              <div key={s.nhan} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{s.nhan}</p>
                <p className="mt-1 font-serif text-2xl font-black text-ink">{s.giaTri}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {dangSua ? (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
                <input
                  value={suaTen}
                  onChange={(e) => setSuaTen(e.target.value)}
                  placeholder="Tên kế hoạch"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                />
                <input
                  value={suaTuNgay}
                  onChange={(e) => setSuaTuNgay(e.target.value)}
                  placeholder="Từ ngày"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                />
                <input
                  value={suaDenNgay}
                  onChange={(e) => setSuaDenNgay(e.target.value)}
                  placeholder="Đến ngày"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                />
                <NutBam tieuDe="Lưu" dangTai={capNhat.isPending} khiBam={luuSua} className="px-5" />
                <NutBam tieuDe="Hủy" bienThe="mo" khiBam={() => setDangSua(false)} />
                {loiSua ? <p className="w-full text-left text-sm text-red-600">{loiSua}</p> : null}
              </div>
            ) : (
              <>
                <NutBam tieuDe="Sửa kế hoạch" bienThe="vien" khiBam={batDauSua} />
                <NutBam tieuDe="Xóa kế hoạch" bienThe="mo" dangTai={xoa.isPending} khiBam={() => xoa.mutate()} />
              </>
            )}
          </div>

          <h2 className="mt-8 font-serif text-2xl font-black text-ink">Lịch trình bữa ăn trong tuần</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ngayTrongTuan.map((ngay) => {
              const iso = format(ngay, 'yyyy-MM-dd');
              const mon = monTheoNgay(iso);
              const dangThem = themNgay === iso;
              return (
                <div key={iso} className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-center text-xs text-muted">{format(ngay, 'dd/MM')}</p>
                  <p className="text-center font-serif text-base font-black text-ink">
                    {TEN_THU[ngay.getDay()]}
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {mon.length === 0 && !dangThem ? (
                      <CaptionText canLe="giua">Trống</CaptionText>
                    ) : (
                      mon.map((m) => (
                        <div key={m.id} className="rounded-xl bg-mist p-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-deepteal">
                            {TEN_BUOI[m.loaiBuoiAn] ?? m.loaiBuoiAn}
                          </p>
                          {m.congThuc ? (
                            <Link to={`/cong-thuc/${m.congThuc.id}`} className="mt-0.5 block text-left text-xs font-semibold text-ink hover:underline">
                              {m.congThuc.ten}
                            </Link>
                          ) : (
                            <p className="text-left text-xs text-muted">Món tự do</p>
                          )}
                          {m.congThuc?.anhThumbnail ? (
                            <img src={layUrlAnhWeb(m.congThuc.anhThumbnail)} alt="" className="mt-1 h-14 w-full rounded-lg object-cover" loading="lazy" />
                          ) : null}
                          <div className="mt-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label="Giảm khẩu phần"
                                onClick={() => suaKhauPhan.mutate({ monId: m.id, khauPhan: Math.max(1, m.khauPhan - 1) })}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold"
                              >
                                −
                              </button>
                              <NumberDisplay value={m.khauPhan} unit="ng" className="text-xs" />
                              <button
                                type="button"
                                aria-label="Tăng khẩu phần"
                                onClick={() => suaKhauPhan.mutate({ monId: m.id, khauPhan: Math.min(20, m.khauPhan + 1) })}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white"
                              >
                                +
                              </button>
                            </span>
                            <button
                              type="button"
                              onClick={() => xoaMon.mutate(m.id)}
                              className="text-xs font-medium text-red-600"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    {dangThem ? (
                      <div className="rounded-xl border border-accent bg-white p-2">
                        <div className="flex gap-1">
                          {(
                            [
                              { ma: 'yeu-thich', nhan: 'Món yêu thích' },
                              { ma: 'cua-toi', nhan: 'Món của tôi' },
                            ] as const
                          ).map((t) => (
                            <button
                              key={t.ma}
                              type="button"
                              onClick={() => {
                                setNguonMon(t.ma);
                                setCongThucChon('');
                              }}
                              className={`flex-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                                nguonMon === t.ma ? 'bg-ink text-white' : 'bg-mist text-slate-500'
                              }`}
                            >
                              {t.nhan}
                            </button>
                          ))}
                        </div>
                        <input
                          value={tuKhoaMon}
                          onChange={(e) => setTuKhoaMon(e.target.value)}
                          placeholder="Tìm món..."
                          className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none"
                        />
                        {(goiYMon.data?.noiDung ?? [])
                          .filter((ct) => !tuKhoaMon.trim() || ct.ten.toLowerCase().includes(tuKhoaMon.trim().toLowerCase()))
                          .map((ct) => (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => setCongThucChon(ct.id)}
                            className={`mt-1 w-full truncate rounded-lg px-2 py-1.5 text-left text-xs ${
                              congThucChon === ct.id ? 'bg-accent-light font-semibold' : 'hover:bg-mist'
                            }`}
                          >
                            {ct.ten}
                          </button>
                        ))}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {CAC_BUOI.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setBuoiChon(b)}
                              className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                                buoiChon === b ? 'bg-ink text-white' : 'bg-mist text-slate-500'
                              }`}
                            >
                              {TEN_BUOI[b]}
                            </button>
                          ))}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">Khẩu phần:</span>
                          <button
                            type="button"
                            onClick={() => setKhauPhanMoi((v) => Math.max(1, v - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-bold"
                          >
                            −
                          </button>
                          <NumberDisplay value={khauPhanMoi} unit="ng" className="text-xs" />
                          <button
                            type="button"
                            onClick={() => setKhauPhanMoi((v) => Math.min(20, v + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-1 flex gap-1">
                          <button
                            type="button"
                            disabled={!congThucChon || themMon.isPending}
                            onClick={() => themMon.mutate()}
                            className="flex-1 rounded-lg bg-ink px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Thêm
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setThemNgay('');
                              setCongThucChon('');
                              setLoiThemMon('');
                            }}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                        {loiThemMon ? <p className="mt-1 text-left text-xs text-red-600">{loiThemMon}</p> : null}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setThemNgay(iso);
                          setCongThucChon('');
                          setTuKhoaMon('');
                        }}
                        className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-semibold text-muted"
                      >
                        <PlusIcon className="h-3.5 w-3.5" /> Thêm món
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <CalendarDaysIcon className="h-4 w-4" />
            <ChevronLeftIcon className="h-4 w-4" />
            {chiTiet.data.ten} • {format(parseISO(chiTiet.data.ngayBatDau), 'dd/MM/yyyy')} —{' '}
            {format(parseISO(chiTiet.data.ngayKetThuc), 'dd/MM/yyyy')}
            <ChevronRightIcon className="h-4 w-4" />
          </p>
        </>
      )}
    </div>
  );
}
