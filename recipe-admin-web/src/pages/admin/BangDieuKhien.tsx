import { useQuery } from '@tanstack/react-query';
import { formatVn } from '@cook/shared';
import { layDashboard } from '../../api/admin';

// BR-ADM: Tổng quan — 4 thẻ số + top đánh giá + tăng trưởng 7 ngày
export function BangDieuKhien() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: layDashboard,
  });

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-red-600">Không tải được số liệu</p>
        <button type="button" onClick={() => refetch()} className="mt-2 rounded bg-teal-600 px-4 py-2 text-white">
          Thử lại
        </button>
      </div>
    );

  const the = [
    { nhan: 'Người dùng', so: data.tongNguoiDung },
    { nhan: 'Hoạt động 7 ngày', so: data.dangHoatDong },
    { nhan: 'Bài chờ duyệt', so: data.baiChoDuyet },
    { nhan: 'Bài đã duyệt', so: data.baiDaDuyet },
    { nhan: 'Lượt thích', so: data.tuongTac?.tongYeuThich ?? 0 },
    { nhan: 'Lượt chấm', so: data.tuongTac?.tongDanhGia ?? 0 },
    { nhan: 'Bình luận', so: data.tuongTac?.tongBinhLuan ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-left text-2xl font-bold">Tổng quan</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {the.map(({ nhan, so }) => (
          <div key={nhan} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="number-vn text-left text-2xl font-black">{formatVn(so)}</p>
            <p className="mt-1 text-left text-sm text-slate-500">{nhan}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 text-left text-lg font-bold">Top đánh giá</h2>
      <table className="mt-2 w-full border-collapse bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">STT</th>
            <th className="border p-2 text-left">Tên món</th>
            <th className="border p-2 text-right">Điểm TB</th>
            <th className="border p-2 text-right">Lượt chấm</th>
          </tr>
        </thead>
        <tbody>
          {data.topDanhGia.map((dong, i) => (
            <tr key={dong.id} className="border-t">
              <td className="number-vn border p-2">{i + 1}</td>
              <td className="border p-2 text-left">{dong.ten}</td>
              <td className="number-vn border p-2">{dong.diemTrungBinh}</td>
              <td className="number-vn border p-2">{formatVn(dong.tongDanhGia)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-left text-lg font-bold">Người dùng mới (7 ngày)</h2>
          <ul className="mt-2 rounded-2xl bg-white p-4 shadow-sm">
            {data.tangTruongNguoiDung.map((diem) => (
              <li key={diem.ngay} className="flex items-center justify-between border-b py-1.5 last:border-0">
                <span className="text-left text-sm">{diem.ngay}</span>
                <span className="number-vn text-sm font-semibold">{formatVn(diem.soLuong)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-left text-lg font-bold">Bài viết mới (7 ngày)</h2>
          <ul className="mt-2 rounded-2xl bg-white p-4 shadow-sm">
            {data.tangTruongCongThuc.map((diem) => (
              <li key={diem.ngay} className="flex items-center justify-between border-b py-1.5 last:border-0">
                <span className="text-left text-sm">{diem.ngay}</span>
                <span className="number-vn text-sm font-semibold">{formatVn(diem.soLuong)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
