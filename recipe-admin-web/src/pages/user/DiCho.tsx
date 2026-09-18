import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aggregateQuantities } from '@cook/shared';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import { chuyenTrangThaiMon, layChiTietDiCho, layDanhSachDiCho } from '../../api/diCho';

// BR-SHOP: Tick đã mua persist server; gộp định lượng theo BR-03
export function DiCho() {
  const queryClient = useQueryClient();
  const [danhSachChon, setDanhSachChon] = useState('');

  const danhSach = useQuery({
    queryKey: ['user', 'shopping'],
    queryFn: () => layDanhSachDiCho(0, 20),
  });
  const dsId = danhSachChon || danhSach.data?.noiDung[0]?.id || '';
  const chiTiet = useQuery({
    queryKey: ['user', 'shopping', dsId],
    queryFn: () => layChiTietDiCho(dsId),
    enabled: !!dsId,
  });
  const chuyenTrangThai = useMutation({
    mutationFn: ({ itemId, daChon }: { itemId: string; daChon: boolean }) =>
      chuyenTrangThaiMon(dsId, itemId, daChon),
    onSuccess: (moi) => queryClient.setQueryData(['user', 'shopping', dsId], moi),
    onError: () => alert('[SHOP-01] Không cập nhật được, thử lại'),
  });

  const tongHop = useMemo(() => {
    const mons = chiTiet.data?.cacMon ?? [];
    return [...aggregateQuantities(
      mons.map((mon) => ({
        ...(mon.nguyenLieuId ? { internalIngredientId: mon.nguyenLieuId } : {}),
        originalText: mon.tenGoc,
        quantity: Number(mon.dinhLuong) || 0,
        unit: mon.donVi,
      })),
    ).values()];
  }, [chiTiet.data]);

  const daMua = (chiTiet.data?.cacMon ?? []).filter((m) => m.daChon).length;
  const tong = chiTiet.data?.cacMon.length ?? 0;
  const tyLe = tong === 0 ? 0 : Math.round((daMua / tong) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">
        Tiện ích gian bếp gia đình
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">
          Danh Sách Đi Chợ Gia Đình
        </h1>
        <div className="flex gap-2">
          <select
            value={dsId}
            onChange={(e) => setDanhSachChon(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
            aria-label="Chọn danh sách"
          >
            {(danhSach.data?.noiDung ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.ten}
              </option>
            ))}
          </select>
          <NutBam tieuDe="In phiếu" bienThe="vien" khiBam={() => window.print()} />
        </div>
      </div>

      {danhSach.isLoading || chiTiet.isLoading ? (
        <TrangDangTai />
      ) : danhSach.isError || !danhSach.data ? (
        <TrangLoi loi="[SHOP-01] Không tải được danh sách" khiThuLai={() => danhSach.refetch()} />
      ) : !chiTiet.data ? (
        <TrangTrong nhan="Bạn chưa có danh sách nào — tạo từ Kế hoạch ăn" />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-40px bg-white p-5 shadow-magazine md:p-8">
            <div className="flex items-center justify-between">
              <p className="font-serif text-xl font-bold text-ink">{chiTiet.data.ten}</p>
              <CaptionText>
                Đã mua <NumberDisplay value={daMua} />/<NumberDisplay value={tong} /> món ({tyLe}%)
              </CaptionText>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-deepteal transition-all" style={{ width: `${tyLe}%` }} />
            </div>
            <ul className="mt-4">
              {chiTiet.data.cacMon.map((mon) => (
                <li key={mon.id}>
                  <button
                    type="button"
                    onClick={() => chuyenTrangThai.mutate({ itemId: mon.id, daChon: !mon.daChon })}
                    className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left"
                  >
                    <span
                      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                        mon.daChon ? 'border-deepteal bg-deepteal text-white' : 'border-muted'
                      }`}
                    >
                      {mon.daChon ? '✓' : ''}
                    </span>
                    <span className={`flex-1 ${mon.daChon ? 'text-muted line-through' : 'text-ink'}`}>
                      {mon.tenGoc}
                    </span>
                    <NumberDisplay value={Number(mon.dinhLuong) || 0} unit={mon.donVi} className="text-sm font-semibold" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit rounded-40px bg-white p-5 shadow-magazine lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-deepteal">Tổng hợp</p>
            <p className="font-serif text-xl font-bold text-ink">Gộp trùng nguyên liệu</p>
            <CaptionText>BR-03: cùng nguyên liệu + cùng đơn vị thì cộng gộp</CaptionText>
            <ul className="mt-3">
              {tongHop.map((nhom, i) => (
                <li key={i} className="flex items-center justify-between border-b border-slate-100 py-2">
                  <span className="flex-1 truncate text-left text-sm text-ink">
                    {nhom.originalTexts[0]}
                    {nhom.originalTexts.length > 1 ? ` (+${nhom.originalTexts.length - 1})` : ''}
                  </span>
                  <NumberDisplay value={nhom.quantity} unit={nhom.unit} className="text-sm font-semibold" />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
