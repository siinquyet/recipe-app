import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { layNhatKy } from '../../api/admin';
import { NhanTrangThai } from '../../components/admin/NhanTrangThai';

const KICH_THUOC = 20;
const CAC_HANH_DONG = [
  '',
  'APPROVE',
  'REJECT',
  'HIDE',
  'UNHIDE',
  'BAN_USER',
  'ACTIVATE_USER',
  'CHANGE_ROLE',
  'RESOLVE_REPORT',
  'UPDATE',
] as const;

function tomTatDuLieu(duLieu: unknown): string {
  if (duLieu === null || duLieu === undefined) return '—';
  try {
    const s = JSON.stringify(duLieu);
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  } catch {
    return '—';
  }
}

// BR-05: Nhật ký kiểm toán — ai làm gì, với cái gì, khi nào (kể cả quyết định của máy)
export function NhatKy() {
  const [trang, setTrang] = useState(0);
  const [hanhDong, setHanhDong] = useState<string>('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'nhat-ky', trang, hanhDong],
    queryFn: () => layNhatKy(trang, KICH_THUOC, hanhDong || undefined),
  });

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-red-600">Không tải được nhật ký</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded bg-teal-600 px-4 py-2 text-white">
          Thử lại
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">Nhật ký ({formatVn(data.tongSoPhanTu)})</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setHanhDong('');
            setTrang(0);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            hanhDong === '' ? 'bg-ink text-white' : 'bg-white text-slate-600'
          }`}
        >
          Tất cả
        </button>
        {CAC_HANH_DONG.filter((h) => h !== '').map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => {
              setHanhDong(h);
              setTrang(0);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              hanhDong === h ? 'bg-ink text-white' : 'bg-white text-slate-600'
            }`}
          >
            <NhanTrangThai ma={h} />
          </button>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <p className="mt-4 text-left text-slate-500">Chưa có hoạt động nào.</p>
      ) : (
        <table className="mt-4 w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">STT</th>
              <th className="border p-2 text-left">Hành động</th>
              <th className="border p-2 text-left">Người làm</th>
              <th className="border p-2 text-left">Đối tượng</th>
              <th className="border p-2 text-left">Thay đổi</th>
              <th className="border p-2 text-left">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {data.noiDung.map((dong, i) => (
              <tr key={dong.id} className="border-t align-top">
                <td className="number-vn border p-2">{trang * KICH_THUOC + i + 1}</td>
                <td className="border p-2">
                  <NhanTrangThai ma={dong.hanhDong} />
                </td>
                <td className="border p-2 text-left text-sm">
                  <p>{dong.nguoiLam.tenHienThi}</p>
                  <p className="text-slate-500">{dong.nguoiLam.email}</p>
                </td>
                <td className="border p-2 text-left font-mono text-xs">
                  {dong.loaiThucThe}/{dong.thucTheId.slice(0, 8)}…
                </td>
                <td className="border p-2 text-left font-mono text-xs text-slate-600">
                  <p>− {tomTatDuLieu(dong.duLieuCu)}</p>
                  <p>+ {tomTatDuLieu(dong.duLieuMoi)}</p>
                </td>
                <td className="border p-2 text-left text-sm">
                  {format(new Date(dong.ngayTao), 'HH:mm dd/MM/yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-3 text-left text-sm text-slate-500">
        Trang {data.tongSoTrang === 0 ? 0 : trang + 1}/{formatVn(data.tongSoTrang)} • {formatVn(data.tongSoPhanTu)} dòng
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
