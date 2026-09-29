import type { FC, ReactNode } from 'react';

interface ONhapLieuProps {
  nhan: string;
  giaTri: string;
  khiDoi: (giaTri: string) => void;
  goiY?: string;
  loi?: string;
  loai?: string;
  className?: string;
  bieuTuong?: ReactNode;
}

// BR-UI: Ô nhập liệu — nhãn trên, lỗi Việt dưới, icon trái tùy chọn theo DESIGN.md
export const ONhapLieu: FC<ONhapLieuProps> = ({
  nhan,
  giaTri,
  khiDoi,
  goiY = '',
  loi,
  loai = 'text',
  className = '',
  bieuTuong,
}) => (
  <label className={`block text-left text-sm font-medium text-primary ${className}`}>
    {nhan}
    <span className="relative mt-1 block">
      {bieuTuong ? (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {bieuTuong}
        </span>
      ) : null}
      <input
        type={loai}
        value={giaTri}
        onChange={(e) => khiDoi(e.target.value)}
        placeholder={goiY}
        className={`w-full rounded-xl border border-neutral-300 bg-white py-3 pr-4 text-base text-neutral-900 outline-none focus:border-accent ${
          bieuTuong ? 'pl-12' : 'px-4'
        }`}
      />
    </span>
    {loi ? <span className="mt-1 block text-sm text-danger">{loi}</span> : null}
  </label>
);
