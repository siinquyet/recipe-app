import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { doiRole, khoaNguoiDung, layNguoiDung, moKhoaNguoiDung } from '../../api/admin';
import { NhanTrangThai } from '../../components/admin/NhanTrangThai';
import {
  BangAdmin,
  ChipLoc,
  ODuLieu,
  OTieuDe,
  PhanTrang,
  TheAdmin,
  TieuDeTrang,
} from '../../components/admin/KhungAdmin';

const KICH_THUOC = 20;
const CAC_TRANG_THAI = [
  { ma: '', nhan: 'Tất cả' },
  { ma: 'ACTIVE', nhan: 'Đang hoạt động' },
  { ma: 'BANNED', nhan: 'Bị khóa' },
] as const;

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
      <TieuDeTrang tieuDe={`Người dùng (${formatVn(data.tongSoPhanTu)})`} moTa="Khóa vi phạm, phân quyền điều hành" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') tim();
          }}
          placeholder="Tìm email, tên..."
          aria-label="Tìm người dùng"
          className="w-56 rounded-xl border-[1.5px] border-muted/40 bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="button"
          onClick={tim}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          Tìm
        </button>
        {CAC_TRANG_THAI.map((tt) => (
          <ChipLoc
            key={tt.ma}
            chon={trangThai === tt.ma}
            khiBam={() => {
              setTrangThai(tt.ma);
              setTrang(0);
            }}
          >
            {tt.nhan}
          </ChipLoc>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <TheAdmin>
          <p className="text-left text-muted">Không tìm thấy ai.</p>
        </TheAdmin>
      ) : (
        <TheAdmin className="p-2 md:p-3">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Email</OTieuDe>
                <OTieuDe>Tên</OTieuDe>
                <OTieuDe className="text-right">Bài viết</OTieuDe>
                <OTieuDe>Role</OTieuDe>
                <OTieuDe>Trạng thái</OTieuDe>
                <OTieuDe>Ngày tạo</OTieuDe>
                <OTieuDe>Thao tác</OTieuDe>
              </>
            }
            hang={data.noiDung.map((nd, i) => (
              <tr key={nd.id}>
                <ODuLieu className="number-vn">{trang * KICH_THUOC + i + 1}</ODuLieu>
                <ODuLieu className="text-sm text-ink">{nd.email}</ODuLieu>
                <ODuLieu className="text-sm font-semibold text-ink">{nd.tenHienThi}</ODuLieu>
                <ODuLieu className="number-vn">{formatVn(nd.soBaiViet)}</ODuLieu>
                <ODuLieu>
                  <select
                    value={nd.vaiTro}
                    aria-label={`Đổi vai trò ${nd.email}`}
                    onChange={(e) => doi.mutate({ id: nd.id, role: e.target.value as 'USER' | 'ADMIN' })}
                    className="rounded-xl border-[1.5px] border-muted/40 bg-white px-2.5 py-1.5 text-sm font-semibold text-ink outline-none focus:border-accent"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </ODuLieu>
                <ODuLieu>
                  <NhanTrangThai ma={nd.trangThai} />
                </ODuLieu>
                <ODuLieu className="text-sm">{format(new Date(nd.ngayTao), 'dd/MM/yyyy')}</ODuLieu>
                <ODuLieu>
                  {nd.trangThai === 'BANNED' ? (
                    <button
                      type="button"
                      disabled={moKhoa.isPending}
                      onClick={() => moKhoa.mutate(nd.id)}
                      className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      Mở khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={khoa.isPending}
                      onClick={() => {
                        if (window.confirm(`Khóa tài khoản ${nd.email}? Người này sẽ không đăng nhập được.`)) {
                          khoa.mutate(nd.id);
                        }
                      }}
                      className="rounded-xl border-[1.5px] border-danger/40 bg-white px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-50"
                    >
                      Khóa
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
        donVi="người"
        lui={() => setTrang((t) => Math.max(0, t - 1))}
        toi={() => setTrang((t) => t + 1)}
      />
    </div>
  );
}
