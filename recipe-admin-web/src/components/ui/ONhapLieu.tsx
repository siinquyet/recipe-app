import type { FC } from 'react';

interface ONhapLieuProps {
  nhan: string;
  giaTri: string;
  khiDoi: (giaTri: string) => void;
  goiY?: string;
  loi?: string;
  loai?: string;
  className?: string;
}

// BR-UI: Ô nhập liệu — nhãn trên, lỗi Việt dưới
export const ONhapLieu: FC<ONhapLieuProps> = ({
  nhan,
  giaTri,
  khiDoi,
  goiY = '',
  loi,
  loai = 'text',
  className = '',
}) => (
  <label className={`block text-left text-sm font-medium text-primary ${className}`}>
    {nhan}
    <input
      type={loai}
      value={giaTri}
      onChange={(e) => khiDoi(e.target.value)}
      placeholder={goiY}
      className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-accent"
    />
    {loi ? <span className="mt-1 block text-sm text-danger">{loi}</span> : null}
  </label>
);
