import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { NumberDisplay } from '../ui/NumberDisplay';
import type { CongThuc } from '../../api/congThuc';

export type BienTheCard = 'compact' | 'large' | 'grid';

interface TheCongThucProps {
  duLieu: CongThuc;
  bienThe?: BienTheCard;
}

function gocBackend(): string {
  if (typeof window === 'undefined') return '';
  return window.location.protocol === 'http:' && window.location.hostname === 'localhost'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : '';
}

// BR-UREC: Backend trả đường dẫn tương đối (/uploads/x.jpg) — FE đổi tuyệt đối để hiện
export function layUrlAnhWeb(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|data:|file:)/i.test(url)) return url;
  const goc = gocBackend();
  return `${goc}${url.startsWith('/') ? url : `/${url}`}`;
}

const HinhAnhMon: FC<{ ct: CongThuc }> = ({ ct }) => {
  const src = layUrlAnhWeb(ct.anhThumbnail);
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream">
        <span className="text-3xl font-bold text-accent">{ct.ten.trim().charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return <img src={src} alt={ct.ten} className="h-full w-full object-cover" loading="lazy" />;
};

const NhanDanhGia: FC<{ diem: number }> = ({ diem }) => (
  <span className="flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-0.5">
    <StarIcon className="h-3 w-3 text-stargold" fill="currentColor" />
    <span className="text-[11px] font-bold text-white">{diem.toFixed(1)}</span>
  </span>
);

// BR-UI: Thẻ công thức 3 biến thể y mobile — badge sao, tên trái, Kcal • phút
export const TheCongThuc: FC<TheCongThucProps> = ({ duLieu: ct, bienThe = 'large' }) => {
  const diem = 0;
  const calo = ct.dinhDuong ? `${ct.dinhDuong.calo} Kcal` : '— Kcal';
  const noiDung = (
    <>
      <div className={`relative w-full ${bienThe === 'large' ? 'h-28 w-28 shrink-0' : 'h-36'}`}>
        <HinhAnhMon ct={ct} />
        {diem > 0 ? (
          <span className="absolute right-2 top-2">
            <NhanDanhGia diem={diem} />
          </span>
        ) : null}
      </div>
      <div className="flex-1 p-3">
        <p className={`text-left font-semibold text-neutral-900 ${bienThe === 'large' ? 'text-base' : 'text-[15px]'}`}>
          {ct.ten}
        </p>
        <p className="mt-1 text-left text-xs text-neutral-500">{ct.tacGia.tenHienThi}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            <NumberDisplay value={ct.thoiGianNauPhut} unit="p" />
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5" />
            <NumberDisplay value={ct.khauPhan} unit="người" />
          </span>
          <span>{calo}</span>
        </div>
      </div>
    </>
  );

  return (
    <Link
      to={`/cong-thuc/${ct.id}`}
      aria-label={ct.ten}
      className={`overflow-hidden rounded-2xl bg-white shadow-sm transition hover:scale-[1.01] ${
        bienThe === 'large' ? 'flex' : `block ${bienThe === 'compact' ? 'w-56 shrink-0' : ''}`
      }`}
    >
      {noiDung}
    </Link>
  );
};
