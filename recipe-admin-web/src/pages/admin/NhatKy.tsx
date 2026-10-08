import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatVn } from '@cook/shared';
import { layNhatKy } from '../../api/admin';
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
      <TieuDeTrang tieuDe={`Nhật ký (${formatVn(data.tongSoPhanTu)})`} moTa="Mọi thao tác điều hành, kể cả của máy" />
      <div className="mt-3 flex flex-wrap gap-2">
        <ChipLoc
          chon={hanhDong === ''}
          khiBam={() => {
            setHanhDong('');
            setTrang(0);
          }}
        >
          Tất cả
        </ChipLoc>
        {CAC_HANH_DONG.filter((h) => h !== '').map((h) => (
          <ChipLoc
            key={h}
            chon={hanhDong === h}
            khiBam={() => {
              setHanhDong(h);
              setTrang(0);
            }}
          >
            <NhanTrangThai ma={h} />
          </ChipLoc>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <TheAdmin>
          <p className="text-left text-muted">Chưa có hoạt động nào.</p>
        </TheAdmin>
      ) : (
        <TheAdmin className="p-2 md:p-3">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Hành động</OTieuDe>
                <OTieuDe>Người làm</OTieuDe>
                <OTieuDe>Đối tượng</OTieuDe>
                <OTieuDe>Thay đổi</OTieuDe>
                <OTieuDe>Thời gian</OTieuDe>
              </>
            }
            hang={data.noiDung.map((dong, i) => (
              <tr key={dong.id}>
                <ODuLieu className="number-vn">{trang * KICH_THUOC + i + 1}</ODuLieu>
                <ODuLieu>
                  <NhanTrangThai ma={dong.hanhDong} />
                </ODuLieu>
                <ODuLieu>
                  <p className="text-sm font-semibold text-ink">{dong.nguoiLam.tenHienThi}</p>
                  <p className="text-xs text-muted">{dong.nguoiLam.email}</p>
                </ODuLieu>
                <ODuLieu className="font-mono text-xs text-ink">
                  {dong.loaiThucThe}/{dong.thucTheId.slice(0, 8)}…
                </ODuLieu>
                <ODuLieu className="font-mono text-xs text-muted">
                  <p>− {tomTatDuLieu(dong.duLieuCu)}</p>
                  <p>+ {tomTatDuLieu(dong.duLieuMoi)}</p>
                </ODuLieu>
                <ODuLieu className="text-sm">{format(new Date(dong.ngayTao), 'HH:mm dd/MM/yyyy')}</ODuLieu>
              </tr>
            ))}
          />
        </TheAdmin>
      )}
      <PhanTrang
        trang={trang}
        tongTrang={data.tongSoTrang}
        tongSo={data.tongSoPhanTu}
        donVi="dòng"
        lui={() => setTrang((t) => Math.max(0, t - 1))}
        toi={() => setTrang((t) => t + 1)}
      />
    </div>
  );
}
