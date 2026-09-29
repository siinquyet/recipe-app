import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aggregateQuantities } from '@cook/shared';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../components/ui/TrangThai';
import { CaptionText } from '../../components/ui/VanBan';
import {
  chuyenTrangThaiMon,
  layChiTietDiCho,
  layDanhSachDiCho,
  suaMonDiCho,
  taoDanhSachDiCho,
  themMonDiCho,
  xoaDanhSachDiCho,
  xoaMonDiCho,
} from '../../api/diCho';

// BR-SHOP: CRUD đầy đủ — tạo/xóa danh sách, thêm/sửa/xóa/tick món, gộp BR-03
export function DiCho() {
  const queryClient = useQueryClient();
  const [danhSachChon, setDanhSachChon] = useState('');
  const [dangTao, setDangTao] = useState(false);
  const [tenMoi, setTenMoi] = useState('');
  const [dangThemMon, setDangThemMon] = useState(false);
  const [tenMonMoi, setTenMonMoi] = useState('');
  const [luongMoi, setLuongMoi] = useState('');
  const [donViMoi, setDonViMoi] = useState('g');
  const [dangSuaId, setDangSuaId] = useState('');
  const [suaTen, setSuaTen] = useState('');
  const [suaLuong, setSuaLuong] = useState('');
  const [suaDonVi, setSuaDonVi] = useState('');

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
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'shopping'] });
  };
  const chuyenTrangThai = useMutation({
    mutationFn: ({ itemId, daChon }: { itemId: string; daChon: boolean }) =>
      chuyenTrangThaiMon(dsId, itemId, daChon),
    onSuccess: (moi) => queryClient.setQueryData(['user', 'shopping', dsId], moi),
    onError: () => alert('[SHOP-01] Không cập nhật được, thử lại'),
  });
  const taoMoi = useMutation({
    mutationFn: () => taoDanhSachDiCho(tenMoi.trim()),
    onSuccess: (moi) => {
      setTenMoi('');
      setDangTao(false);
      setDanhSachChon(moi.id);
      lamMoi();
    },
    onError: () => alert('[SHOP-01] Không tạo được, thử lại'),
  });
  const xoaDanhSach = useMutation({
    mutationFn: () => xoaDanhSachDiCho(dsId),
    onSuccess: () => {
      setDanhSachChon('');
      lamMoi();
    },
    onError: () => alert('[SHOP-01] Không xóa được, thử lại'),
  });
  const themMon = useMutation({
    mutationFn: () =>
      themMonDiCho(dsId, {
        tenGoc: tenMonMoi.trim(),
        dinhLuong: parseFloat(luongMoi.replace(',', '.')) || 0,
        donVi: donViMoi.trim() || 'g',
      }),
    onSuccess: (moi) => {
      queryClient.setQueryData(['user', 'shopping', dsId], moi);
      setTenMonMoi('');
      setLuongMoi('');
      setDonViMoi('g');
      setDangThemMon(false);
      lamMoi();
    },
    onError: () => alert('[SHOP-01] Không thêm được, thử lại'),
  });
  const suaMon = useMutation({
    mutationFn: ({ itemId }: { itemId: string }) =>
      suaMonDiCho(dsId, itemId, {
        tenGoc: suaTen.trim(),
        dinhLuong: parseFloat(suaLuong.replace(',', '.')) || 0,
        donVi: suaDonVi.trim() || 'g',
      }),
    onSuccess: (moi) => {
      queryClient.setQueryData(['user', 'shopping', dsId], moi);
      setDangSuaId('');
    },
    onError: () => alert('[SHOP-01] Không sửa được, thử lại'),
  });
  const xoaMon = useMutation({
    mutationFn: (itemId: string) => xoaMonDiCho(dsId, itemId),
    onSuccess: (moi) => {
      queryClient.setQueryData(['user', 'shopping', dsId], moi);
      lamMoi();
    },
    onError: () => alert('[SHOP-01] Không xóa được, thử lại'),
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
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="vien" khiBam={() => setDangTao((v) => !v)} />
        </div>
      </div>

      {dangTao ? (
        <div className="mt-4 flex max-w-md gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <input
            value={tenMoi}
            onChange={(e) => setTenMoi(e.target.value)}
            placeholder="VD: Đi chợ cuối tuần"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <NutBam tieuDe="Tạo" dangTai={taoMoi.isPending} voHieuHoa={!tenMoi.trim()} khiBam={() => taoMoi.mutate()} />
        </div>
      ) : null}

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
                <li key={mon.id} className="border-b border-slate-100 py-3">
                  <div className="flex w-full items-center gap-3 text-left">
                    <button
                      type="button"
                      onClick={() => chuyenTrangThai.mutate({ itemId: mon.id, daChon: !mon.daChon })}
                      aria-label={mon.daChon ? 'Bỏ chọn' : 'Đánh dấu đã mua'}
                      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                        mon.daChon ? 'border-deepteal bg-deepteal text-white' : 'border-muted'
                      }`}
                    >
                      {mon.daChon ? '✓' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => chuyenTrangThai.mutate({ itemId: mon.id, daChon: !mon.daChon })}
                      className={`flex-1 text-left ${mon.daChon ? 'text-muted line-through' : 'text-ink'}`}
                    >
                      {mon.tenGoc}
                    </button>
                    <NumberDisplay value={Number(mon.dinhLuong) || 0} unit={mon.donVi} className="text-sm font-semibold" />
                    <button
                      type="button"
                      onClick={() => {
                        if (dangSuaId === mon.id) {
                          setDangSuaId('');
                        } else {
                          setDangSuaId(mon.id);
                          setSuaTen(mon.tenGoc);
                          setSuaLuong(mon.dinhLuong);
                          setSuaDonVi(mon.donVi);
                        }
                      }}
                      className="text-xs font-semibold text-deepteal"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => xoaMon.mutate(mon.id)}
                      className="text-xs font-semibold text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                  {dangSuaId === mon.id ? (
                    <div className="mt-2 rounded-xl bg-mist p-3">
                      <input
                        value={suaTen}
                        onChange={(e) => setSuaTen(e.target.value)}
                        placeholder="Tên món"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                      />
                      <div className="mt-2 flex gap-2">
                        <input
                          value={suaLuong}
                          onChange={(e) => setSuaLuong(e.target.value)}
                          placeholder="Định lượng"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={suaDonVi}
                          onChange={(e) => setSuaDonVi(e.target.value)}
                          placeholder="Đơn vị"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <NutBam
                        tieuDe="Lưu"
                        dangTai={suaMon.isPending}
                        voHieuHoa={!suaTen.trim()}
                        khiBam={() => suaMon.mutate({ itemId: mon.id })}
                        className="mt-2"
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
            <NutBam
              tieuDe={dangThemMon ? 'Hủy' : '+ Thêm món'}
              bienThe="vien"
              khiBam={() => setDangThemMon((v) => !v)}
              className="mt-4"
            />
            {dangThemMon ? (
              <div className="mt-2 rounded-xl bg-mist p-3">
                <input
                  value={tenMonMoi}
                  onChange={(e) => setTenMonMoi(e.target.value)}
                  placeholder="Tên món * (VD: Rau muống)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                />
                <div className="mt-2 flex gap-2">
                  <input
                    value={luongMoi}
                    onChange={(e) => setLuongMoi(e.target.value)}
                    placeholder="Định lượng"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={donViMoi}
                    onChange={(e) => setDonViMoi(e.target.value)}
                    placeholder="Đơn vị (g)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
                <NutBam
                  tieuDe="Thêm vào danh sách"
                  dangTai={themMon.isPending}
                  voHieuHoa={!tenMonMoi.trim()}
                  khiBam={() => themMon.mutate()}
                  className="mt-2"
                />
              </div>
            ) : null}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => xoaDanhSach.mutate()}
                className="text-xs font-semibold text-red-600"
              >
                Xóa danh sách này
              </button>
            </div>
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
