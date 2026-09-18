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
import { layChiTietKeHoachAn, layDanhSachKeHoachAn } from '../../api/keHoachAn';
import { taoDiChoTuKeHoach } from '../../api/diCho';

const TEN_BUOI: Record<string, string> = {
  BREAKFAST: 'Sáng',
  LUNCH: 'Trưa',
  DINNER: 'Tối',
  SNACK: 'Ăn nhẹ',
};

// BR-UI: Thứ tiếng Việt (date-fns mặc định tiếng Anh nên tự map)
const TEN_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

// BR-MEAL: Lịch tuần từ kế hoạch thật; thêm món báo rõ backend chưa hỗ trợ
export function KeHoach() {
  const queryClient = useQueryClient();
  const [keHoachChon, setKeHoachChon] = useState('');

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
  const sinhDiCho = useMutation({
    mutationFn: () => taoDiChoTuKeHoach(keHoachId),
    onSuccess: (ds) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'shopping'] });
      alert(`Đã tạo "${ds.ten}" — sang Đi chợ để xem!`);
    },
    onError: () => alert('[SHOP-01] Cần đăng nhập để tạo danh sách'),
  });

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
          <NutBam tieuDe="Tạo danh sách đi chợ" khiBam={() => keHoachId && sinhDiCho.mutate()} dangTai={sinhDiCho.isPending} />
        </div>
      </div>

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

          <h2 className="mt-8 font-serif text-2xl font-black text-ink">Lịch trình bữa ăn trong tuần</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ngayTrongTuan.map((ngay) => {
              const iso = format(ngay, 'yyyy-MM-dd');
              const mon = monTheoNgay(iso);
              return (
                <div key={iso} className="rounded-2xl bg-white p-3 shadow-sm">
                  <p className="text-center text-xs text-muted">{format(ngay, 'dd/MM')}</p>
                  <p className="text-center font-serif text-base font-black text-ink">
                    {TEN_THU[ngay.getDay()]}
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {mon.length === 0 ? (
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
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => alert('[MEAL-01] Backend chưa hỗ trợ thêm món vào kế hoạch')}
                      className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2 text-xs font-semibold text-muted"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> Thêm món
                    </button>
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
