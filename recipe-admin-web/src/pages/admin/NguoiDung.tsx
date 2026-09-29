import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { doiRole, khoaNguoiDung, layNguoiDung, moKhoaNguoiDung } from '../../api/admin';

const KICH_THUOC = 20;
const CAC_TRANG_THAI = ['', 'ACTIVE', 'BANNED'] as const;

// BR-ADM: Quản lý người dùng — tìm kiếm, lọc trạng thái, khóa/mở, đổi role
export function NguoiDung() {
  const [trang, setTrang] = useState(0);
  const [tuKhoa, setTuKhoa] = useState('');
  const [trangThai, setTrangThai] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', trang, trangThai],
    queryFn: () => layNguoiDung(trang, KICH_THUOC, tuKhoa.trim() || undefined, trangThai || undefined),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };
  const khoa = useMutation({ mutationFn: khoaNguoiDung, onSuccess: lamMoi });
  const moKhoa = useMutation({ mutationFn: moKhoaNguoiDung, onSuccess: lamMoi });
  const doi = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) => doiRole(id, role),
    onSuccess: lamMoi,
  });

  const tim = () => {
    setTrang(0);
    refetch();
  };

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-red-600">Không tải được danh sách</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded bg-teal-600 px-4 py-2 text-white">
          Thử lại
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">Người dùng ({formatVn(data.tongSoPhanTu)})</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') tim();
          }}
          placeholder="Tìm email, tên..."
          className="w-56 rounded-xl border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={tim}
          className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          Tìm
        </button>
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
            {tt === '' ? 'Tất cả' : tt === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}
          </button>
        ))}
      </div>
      <table className="mt-4 w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">STT</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Tên</th>
            <th className="border p-2 text-right">Bài viết</th>
            <th className="border p-2 text-left">Role</th>
            <th className="border p-2 text-left">Trạng thái</th>
            <th className="border p-2 text-left">Ngày tạo</th>
            <th className="border p-2 text-left">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {data.noiDung.map((nd, i) => (
              <tr key={nd.id} className="border-t">
                <td className="number-vn border p-2">{trang * KICH_THUOC + i + 1}</td>
                <td className="border p-2 text-left">{nd.email}</td>
                <td className="border p-2 text-left">{nd.tenHienThi}</td>
                <td className="number-vn border p-2">{formatVn(nd.soBaiViet)}</td>
                <td className="border p-2">
                  <select
                    value={nd.vaiTro}
                    onChange={(e) => doi.mutate({ id: nd.id, role: e.target.value as 'USER' | 'ADMIN' })}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="border p-2 text-left">{nd.trangThai}</td>
                <td className="border p-2 text-left">{format(new Date(nd.ngayTao), 'dd/MM/yyyy')}</td>
                <td className="border p-2">
                  {nd.trangThai === 'BANNED' ? (
                    <button
                      type="button"
                      disabled={moKhoa.isPending}
                      onClick={() => moKhoa.mutate(nd.id)}
                      className="rounded bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Mở khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={khoa.isPending}
                      onClick={() => khoa.mutate(nd.id)}
                      className="rounded border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      Khóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
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
