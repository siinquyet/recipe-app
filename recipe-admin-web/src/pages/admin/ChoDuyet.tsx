import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import {
  chayKiemDuyetTuDong,
  duyetBai,
  hoanTacQuyetDinh,
  layBaiChoDuyet,
  layTatCaBai,
  tuChoiBai,
  type BaiAdmin,
} from '../../api/admin';

const KICH_THUOC = 20;

type Tab = 'cho' | 'da-duyet' | 'da-tu-choi';

const NHAN_GOI_Y: Record<string, { nhan: string; mau: string }> = {
  'nen-duyet': { nhan: 'Nên duyệt', mau: 'text-teal-700' },
  'giu-lai': { nhan: 'Giữ lại xem tay', mau: 'text-amber-600' },
  'nen-tu-choi': { nhan: 'Nên từ chối', mau: 'text-red-600' },
};

function CotGoiY({ bai }: { bai: BaiAdmin }) {
  const goiY = bai.nhanGoiY ? NHAN_GOI_Y[bai.nhanGoiY] : null;
  if (!goiY) return <span className="text-slate-400">—</span>;
  return (
    <div className="text-left">
      <p className={`text-sm font-bold ${goiY.mau}`}>
        {goiY.nhan} ({formatVn(bai.diemTuDong ?? 0)}đ)
      </p>
      {(bai.lyDoGoiY ?? []).map((lyDo) => (
        <p key={lyDo} className="text-xs text-slate-500">
          • {lyDo}
        </p>
      ))}
    </div>
  );
}

// BR-ADM: Hàng chờ duyệt — duyệt 1 chạm, từ chối phải nhập lý do
// BR-ADM-AUTO: Cột gợi ý từ pipeline + nút chạy kiểm duyệt + hoàn tác quyết định
export function ChoDuyet() {
  const [tab, setTab] = useState<Tab>('cho');
  const [trang, setTrang] = useState(0);
  const [lyDo, setLyDo] = useState<Record<string, string>>({});
  const [ketQuaChay, setKetQuaChay] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'cho-duyet', tab, trang],
    queryFn: () =>
      tab === 'cho'
        ? layBaiChoDuyet(trang, KICH_THUOC)
        : layTatCaBai(trang, KICH_THUOC, tab === 'da-duyet' ? 'APPROVED' : 'REJECTED'),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'cho-duyet'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };
  const duyet = useMutation({ mutationFn: duyetBai, onSuccess: lamMoi });
  const tuChoi = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => tuChoiBai(id, reason),
    onSuccess: lamMoi,
  });
  const hoanTac = useMutation({
    mutationFn: hoanTacQuyetDinh,
    onSuccess: lamMoi,
    onError: () => alert('[ADM-06] Không hoàn tác được'),
  });
  const chayTuDong = useMutation({
    mutationFn: chayKiemDuyetTuDong,
    onSuccess: (kq) => {
      setKetQuaChay(
        kq.cheDoTuDong
          ? `Máy đã duyệt ${kq.daDuyet}, từ chối ${kq.daTuChoi}, giữ lại ${kq.giuLai}/${kq.tong} bài`
          : `Chế độ gợi ý: ${kq.tong} bài chờ, máy chưa tự quyết bài nào`,
      );
      lamMoi();
    },
    onError: () => alert('[ADM-00] Không chạy được pipeline'),
  });
  const doiTab = (t: Tab) => {
    setTab(t);
    setTrang(0);
  };

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-red-600">Không tải được hàng chờ</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded bg-teal-600 px-4 py-2 text-white">
          Thử lại
        </button>
      </div>
    );

  const tieuDe = tab === 'cho' ? 'Chờ duyệt' : tab === 'da-duyet' ? 'Đã duyệt' : 'Đã từ chối';

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">
        {tieuDe} ({formatVn(data.tongSoPhanTu)})
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(
          [
            { ma: 'cho', nhan: 'Chờ duyệt' },
            { ma: 'da-duyet', nhan: 'Đã duyệt' },
            { ma: 'da-tu-choi', nhan: 'Đã từ chối' },
          ] as Array<{ ma: Tab; nhan: string }>
        ).map((t) => (
          <button
            key={t.ma}
            type="button"
            onClick={() => doiTab(t.ma)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === t.ma ? 'bg-teal-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            {t.nhan}
          </button>
        ))}
        <button
          type="button"
          disabled={chayTuDong.isPending}
          onClick={() => chayTuDong.mutate()}
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Chạy kiểm duyệt
        </button>
      </div>
      {ketQuaChay ? <p className="mt-2 text-left text-sm text-slate-600">{ketQuaChay}</p> : null}
      {data.noiDung.length === 0 ? (
        <p className="mt-4 text-left text-slate-500">Không có bài nào.</p>
      ) : (
        <table className="mt-4 w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">STT</th>
              <th className="border p-2 text-left">Tên món</th>
              <th className="border p-2 text-left">Tác giả</th>
              <th className="border p-2 text-left">Gợi ý máy</th>
              <th className="border p-2 text-left">Ngày gửi</th>
              <th className="border p-2 text-left">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {data.noiDung.map((bai, i) => (
              <tr key={bai.id} className="border-t align-top">
                <td className="number-vn border p-2">{trang * KICH_THUOC + i + 1}</td>
                <td className="border p-2 text-left">
                  <p className="font-semibold">{bai.ten}</p>
                  {bai.moTa ? <p className="mt-1 text-sm text-slate-500">{bai.moTa}</p> : null}
                  {(bai.canhBao ?? []).map((cb) => (
                    <p
                      key={cb.cap.join('+')}
                      className={`mt-1 text-left text-xs font-semibold ${
                        cb.muc === 'cao' ? 'text-red-600' : 'text-amber-600'
                      }`}
                    >
                      {cb.muc === 'cao' ? 'Cảnh báo độc: ' : 'Lưu ý combo: '}
                      {cb.lyDo}
                    </p>
                  ))}
                  {bai.lyDoTuChoi ? (
                    <p className="mt-1 text-left text-xs text-slate-500">Lý do từ chối: {bai.lyDoTuChoi}</p>
                  ) : null}
                </td>
                <td className="border p-2 text-left">
                  <p>{bai.tacGia.tenHienThi}</p>
                  <p className="text-sm text-slate-500">{bai.tacGia.email}</p>
                </td>
                <td className="border p-2">
                  <CotGoiY bai={bai} />
                </td>
                <td className="border p-2 text-left">{format(new Date(bai.ngayTao), 'dd/MM/yyyy')}</td>
                <td className="border p-2">
                  {tab === 'cho' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={duyet.isPending}
                        onClick={() => duyet.mutate(bai.id)}
                        className="rounded bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Duyệt
                      </button>
                      <input
                        value={lyDo[bai.id] ?? ''}
                        onChange={(e) => setLyDo((cu) => ({ ...cu, [bai.id]: e.target.value }))}
                        placeholder="Lý do từ chối..."
                        className="w-44 rounded border px-2 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        disabled={tuChoi.isPending || !(lyDo[bai.id] ?? '').trim()}
                        onClick={() => tuChoi.mutate({ id: bai.id, reason: (lyDo[bai.id] ?? '').trim() })}
                        className="rounded border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={hoanTac.isPending}
                      onClick={() => hoanTac.mutate(bai.id)}
                      className="rounded border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-700 disabled:opacity-50"
                    >
                      Hoàn tác
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={trang === 0}
          onClick={() => setTrang((t) => Math.max(0, t - 1))}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={trang + 1 >= data.tongSoTrang}
          onClick={() => setTrang((t) => t + 1)}
          className="rounded border px-4 py-2 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
