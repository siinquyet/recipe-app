import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { anBai, hienBai, layTatCaBai } from '../api/admin';
import { NhanTrangThai } from '../components/admin/NhanTrangThai';
import {
  BangAdmin,
  ChipLoc,
  ODuLieu,
  OTieuDe,
  PhanTrang,
  TheAdmin,
  TieuDeTrang,
} from '../components/admin/KhungAdmin';

const KICH_THUOC = 20;
const CAC_TRANG_THAI = ['', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'] as const;

// BR-ADM: Tất cả công thức — lọc trạng thái, ẩn/hiện 1 chạm, STT tự tính
export function RecipeList() {
  const [trang, setTrang] = useState(0);
  const [trangThai, setTrangThai] = useState<string>('');
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'recipes', trang, trangThai],
    queryFn: () => layTatCaBai(trang, KICH_THUOC, trangThai || undefined),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };
  const an = useMutation({ mutationFn: anBai, onSuccess: lamMoi });
  const hien = useMutation({ mutationFn: hienBai, onSuccess: lamMoi });

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
      <TieuDeTrang tieuDe={`Công thức (${formatVn(data.tongSoPhanTu)})`} moTa="Ẩn bài vi phạm 1 chạm" />
      <div className="mt-3 flex flex-wrap gap-2">
        {CAC_TRANG_THAI.map((tt) => (
          <ChipLoc
            key={tt}
            chon={trangThai === tt}
            khiBam={() => {
              setTrangThai(tt);
              setTrang(0);
            }}
          >
            {tt === '' ? 'Tất cả' : tt === 'DRAFT' ? 'Nháp' : tt === 'PENDING' ? 'Chờ duyệt' : tt === 'APPROVED' ? 'Đã duyệt' : tt === 'REJECTED' ? 'Đã từ chối' : 'Đang ẩn'}
          </ChipLoc>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <TheAdmin>
          <p className="text-left text-muted">Không có món nào.</p>
        </TheAdmin>
      ) : (
        <TheAdmin className="p-2 md:p-3">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Tên món</OTieuDe>
                <OTieuDe className="text-right">Nấu (phút)</OTieuDe>
                <OTieuDe className="text-right">Khẩu phần</OTieuDe>
                <OTieuDe>Trạng thái</OTieuDe>
                <OTieuDe>Ngày tạo</OTieuDe>
                <OTieuDe>Ẩn/Hiện</OTieuDe>
              </>
            }
            hang={data.noiDung.map((ct, i) => (
              <tr key={ct.id}>
                <ODuLieu className="number-vn">{trang * KICH_THUOC + i + 1}</ODuLieu>
                <ODuLieu>
                  <p className="font-serif font-bold text-ink">{ct.ten}</p>
                  <p className="text-xs text-muted">{ct.tacGia.tenHienThi}</p>
                </ODuLieu>
                <ODuLieu className="number-vn">{formatVn(ct.thoiGianNauPhut)}</ODuLieu>
                <ODuLieu className="number-vn">{formatVn(ct.khauPhan)}</ODuLieu>
                <ODuLieu>
                  <NhanTrangThai ma={ct.trangThai} />
                </ODuLieu>
                <ODuLieu className="text-sm">{format(new Date(ct.ngayTao), 'dd/MM/yyyy')}</ODuLieu>
                <ODuLieu>
                  {ct.trangThai === 'HIDDEN' ? (
                    <button
                      type="button"
                      disabled={hien.isPending}
                      onClick={() => hien.mutate(ct.id)}
                      className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      Hiện
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={an.isPending}
                      onClick={() => {
                        if (window.confirm(`Ẩn món “${ct.ten}”? Người dùng sẽ không thấy nữa.`)) an.mutate(ct.id);
                      }}
                      className="rounded-xl border-[1.5px] border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist disabled:opacity-50"
                    >
                      Ẩn
                    </button>
                  )}
                </ODuLieu>
              </tr>
            ))}
          />
        </TheAdmin>
      )}
      <PhanTrang
        trang={trang}
        tongTrang={data.tongSoTrang}
        tongSo={data.tongSoPhanTu}
        donVi="món"
        lui={() => setTrang((t) => Math.max(0, t - 1))}
        toi={() => setTrang((t) => t + 1)}
      />
    </div>
  );
}
