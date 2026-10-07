import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { layBaoCao, xuLyBaoCao } from '../../api/admin';
import { NhanTrangThai } from '../../components/admin/NhanTrangThai';

const KICH_THUOC = 20;
const CAC_TRANG_THAI = ['', 'PENDING', 'RESOLVED', 'REJECTED'] as const;

// BR-SOC: Tố cáo vi phạm — lọc trạng thái, xử lý kèm ghi chú, link sang món/bình luận gốc
export function ToCao() {
  const [trang, setTrang] = useState(0);
  const [trangThai, setTrangThai] = useState<string>('');
  const [ghiChu, setGhiChu] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'bao-cao', trang, trangThai],
    queryFn: () => layBaoCao(trang, KICH_THUOC, trangThai || undefined),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'bao-cao'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };
  const xuLy = useMutation({
    mutationFn: ({ id, ketQua }: { id: string; ketQua: 'RESOLVED' | 'REJECTED' }) =>
      xuLyBaoCao(id, ketQua, ghiChu[id]?.trim() || undefined),
    onSuccess: lamMoi,
    onError: (e) => alert(e instanceof Error ? e.message : '[REP-04] Không xử lý được'),
  });

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-red-600">Không tải được danh sách tố cáo</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded bg-teal-600 px-4 py-2 text-white">
          Thử lại
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">Tố cáo ({formatVn(data.tongSoPhanTu)})</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {CAC_TRANG_THAI.map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => {
              setTrangThai(tt);
              setTrang(0);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              trangThai === tt ? 'bg-ink text-white' : 'bg-white text-slate-600'
            }`}
          >
            {tt === '' ? 'Tất cả' : tt === 'PENDING' ? 'Chờ xử lý' : tt === 'RESOLVED' ? 'Đã xử lý' : 'Đã bác'}
          </button>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <p className="mt-4 text-left text-slate-500">Không có tố cáo nào.</p>
      ) : (
        <table className="mt-4 w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">STT</th>
              <th className="border p-2 text-left">Đối tượng</th>
              <th className="border p-2 text-left">Lý do</th>
              <th className="border p-2 text-left">Người báo cáo</th>
              <th className="border p-2 text-left">Trạng thái</th>
              <th className="border p-2 text-left">Ngày báo</th>
              <th className="border p-2 text-left">Xử lý</th>
            </tr>
          </thead>
          <tbody>
            {data.noiDung.map((bc, i) => (
              <tr key={bc.id} className="border-t align-top">
                <td className="number-vn border p-2">{trang * KICH_THUOC + i + 1}</td>
                <td className="border p-2 text-left">
                  {bc.congThuc ? (
                    <Link to={`/cong-thuc/${bc.congThuc.id}`} className="font-semibold text-deepteal hover:underline">
                      Món: {bc.congThuc.ten}
                    </Link>
                  ) : bc.binhLuan ? (
                    <p className="text-sm">Bình luận: “{bc.binhLuan.noiDung}”</p>
                  ) : (
                    <p className="text-sm text-slate-400">—</p>
                  )}
                </td>
                <td className="border p-2 text-left text-sm">{bc.lyDo}</td>
                <td className="border p-2 text-left text-sm">
                  <p>{bc.nguoiBaoCao.tenHienThi}</p>
                  <p className="text-slate-500">{bc.nguoiBaoCao.email}</p>
                </td>
                <td className="border p-2">
                  <NhanTrangThai ma={bc.trangThai} />
                  {bc.ghiChuAdmin ? <p className="mt-1 text-xs text-slate-500">{bc.ghiChuAdmin}</p> : null}
                </td>
                <td className="border p-2 text-left text-sm">{format(new Date(bc.ngayTao), 'dd/MM/yyyy')}</td>
                <td className="border p-2">
                  {bc.trangThai === 'PENDING' ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={ghiChu[bc.id] ?? ''}
                        onChange={(e) => setGhiChu((cu) => ({ ...cu, [bc.id]: e.target.value }))}
                        placeholder="Ghi chú xử lý..."
                        className="w-44 rounded border px-2 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        disabled={xuLy.isPending}
                        onClick={() => xuLy.mutate({ id: bc.id, ketQua: 'RESOLVED' })}
                        className="rounded bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Xác nhận vi phạm
                      </button>
                      <button
                        type="button"
                        disabled={xuLy.isPending}
                        onClick={() => xuLy.mutate({ id: bc.id, ketQua: 'REJECTED' })}
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
                      >
                        Bác báo cáo
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Đã xong</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-3 text-left text-sm text-slate-500">
        Trang {data.tongSoTrang === 0 ? 0 : trang + 1}/{formatVn(data.tongSoTrang)} • {formatVn(data.tongSoPhanTu)} tố cáo
      </p>
      <div className="mt-2 flex gap-2">
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
