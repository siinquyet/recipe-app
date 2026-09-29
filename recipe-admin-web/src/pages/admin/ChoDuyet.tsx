import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { duyetBai, layBaiChoDuyet, tuChoiBai } from '../../api/admin';

const KICH_THUOC = 20;

// BR-ADM: Hàng chờ duyệt — duyệt 1 chạm, từ chối phải nhập lý do
export function ChoDuyet() {
  const [trang, setTrang] = useState(0);
  const [lyDo, setLyDo] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'cho-duyet', trang],
    queryFn: () => layBaiChoDuyet(trang, KICH_THUOC),
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

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">Chờ duyệt ({formatVn(data.tongSoPhanTu)})</h1>
      {data.noiDung.length === 0 ? (
        <p className="mt-4 text-left text-slate-500">Không còn bài nào chờ duyệt.</p>
      ) : (
        <table className="mt-4 w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">STT</th>
              <th className="border p-2 text-left">Tên món</th>
              <th className="border p-2 text-left">Tác giả</th>
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
                </td>
                <td className="border p-2 text-left">
                  <p>{bai.tacGia.tenHienThi}</p>
                  <p className="text-sm text-slate-500">{bai.tacGia.email}</p>
                </td>
                <td className="border p-2 text-left">{format(new Date(bai.ngayTao), 'dd/MM/yyyy')}</td>
                <td className="border p-2">
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
