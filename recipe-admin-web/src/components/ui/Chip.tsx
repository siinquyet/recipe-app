import type { FC } from 'react';

interface ChipProps {
  nhan: string;
  dangChon?: boolean;
  khiBam?: () => void;
}

// BR-UI: Chip lọc — chọn thì nền navy chữ trắng
export const Chip: FC<ChipProps> = ({ nhan, dangChon = false, khiBam }) => (
  <button
    type="button"
    onClick={khiBam}
    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
      dangChon ? 'bg-primary text-white' : 'bg-white text-neutral-600 shadow-sm'
    }`}
  >
    {nhan}
  </button>
);
