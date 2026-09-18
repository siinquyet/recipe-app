import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiClient } from '../api/client';
import { formatVn } from '@cook/shared';

interface CongThucRow {
  id: string;
  ten: string;
  thoiGianNauPhut: number;
  khauPhan: number;
  ngayTao: string;
}

interface TrangCongThuc {
  noiDung: CongThucRow[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

const KICH_THUOC = 20;

// BR-ADM: Danh sách công thức cho admin duyệt — STT tự tính, không hiện ID
export function RecipeList() {
  const [trang, setTrang] = useState(0);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'recipes', trang],
    queryFn: async (): Promise<TrangCongThuc> => {
      const res = await apiClient.get('/recipes', { params: { page: trang, size: KICH_THUOC } });
      return res.data.data as TrangCongThuc;
    },
  });

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
    <div className="p-4">
      <h1 className="text-left text-2xl font-bold">Công thức ({formatVn(data.tongSoPhanTu)})</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">STT</th>
            <th className="border p-2 text-left">Tên món</th>
            <th className="border p-2 text-right">Nấu (phút)</th>
            <th className="border p-2 text-right">Khẩu phần</th>
            <th className="border p-2 text-left">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {data.noiDung.map((ct, i) => (
            <tr key={ct.id} className="border-t">
              <td className="number-vn border p-2">{trang * KICH_THUOC + i + 1}</td>
              <td className="border p-2 text-left">{ct.ten}</td>
              <td className="number-vn border p-2">{formatVn(ct.thoiGianNauPhut)}</td>
              <td className="number-vn border p-2">{formatVn(ct.khauPhan)}</td>
              <td className="border p-2 text-left">{format(new Date(ct.ngayTao), 'dd/MM/yyyy')}</td>
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
