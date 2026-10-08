import { useQuery } from '@tanstack/react-query';
import { formatVn } from '@cook/shared';
import { layDashboard } from '../../api/admin';
import { BangAdmin, ODuLieu, OTieuDe, TheAdmin, TieuDeTrang } from '../../components/admin/KhungAdmin';

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
      <TieuDeTrang tieuDe="Tổng quan" moTa="Nhịp đập của Bếp Nhà trong 7 ngày qua" />
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {the.map(({ nhan, so }, i) => (
          <div
            key={nhan}
            className={`rounded-3xl p-4 shadow-sm ${i === 2 && so > 0 ? 'bg-cream' : 'bg-white'}`}
          >
            <p className="number-vn text-left font-serif text-3xl font-black text-ink">{formatVn(so)}</p>
            <p className="mt-1 text-left text-xs font-bold uppercase tracking-widest text-muted">{nhan}</p>
          </div>
        ))}
      </div>

      <TheAdmin>
        <h2 className="text-left font-serif text-xl font-bold text-ink">Top đánh giá</h2>
        <div className="mt-2">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Tên món</OTieuDe>
                <OTieuDe className="text-right">Điểm TB</OTieuDe>
                <OTieuDe className="text-right">Lượt chấm</OTieuDe>
              </>
            }
            hang={data.topDanhGia.map((dong, i) => (
              <tr key={dong.id}>
                <ODuLieu className="number-vn">{i + 1}</ODuLieu>
                <ODuLieu>
                  <span className="font-semibold text-ink">{dong.ten}</span>
                </ODuLieu>
                <ODuLieu className="number-vn font-bold text-ink">{dong.diemTrungBinh}</ODuLieu>
                <ODuLieu className="number-vn">{formatVn(dong.tongDanhGia)}</ODuLieu>
              </tr>
            ))}
          />
        </div>
      </TheAdmin>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-40px bg-white p-5 shadow-magazine md:p-6">
          <h2 className="text-left font-serif text-xl font-bold text-ink">Người dùng mới (7 ngày)</h2>
          <ul className="mt-2">
            {data.tangTruongNguoiDung.map((diem) => (
              <li key={diem.ngay} className="flex items-center justify-between border-b border-mist py-1.5 last:border-0">
                <span className="text-left text-sm text-ink">{diem.ngay}</span>
                <span className="number-vn text-sm font-semibold text-ink">{formatVn(diem.soLuong)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-40px bg-white p-5 shadow-magazine md:p-6">
          <h2 className="text-left font-serif text-xl font-bold text-ink">Bài viết mới (7 ngày)</h2>
          <ul className="mt-2">
            {data.tangTruongCongThuc.map((diem) => (
              <li key={diem.ngay} className="flex items-center justify-between border-b border-mist py-1.5 last:border-0">
                <span className="text-left text-sm text-ink">{diem.ngay}</span>
                <span className="number-vn text-sm font-semibold text-ink">{formatVn(diem.soLuong)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
