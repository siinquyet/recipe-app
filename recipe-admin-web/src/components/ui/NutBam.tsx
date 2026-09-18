import type { FC } from 'react';

type BienTheNut = 'chinh' | 'phu' | 'vien' | 'mo';

interface NutBamProps {
  tieuDe: string;
  khiBam?: () => void;
  bienThe?: BienTheNut;
  voHieuHoa?: boolean;
  dangTai?: boolean;
  className?: string;
  loai?: 'button' | 'submit';
}

const MAU_NEN: Record<BienTheNut, string> = {
  chinh: 'bg-primary',
  phu: 'bg-neutral-200',
  vien: 'bg-transparent border border-primary',
  mo: 'bg-transparent',
};

const MAU_CHU: Record<BienTheNut, string> = {
  chinh: 'text-white',
  phu: 'text-neutral-900',
  vien: 'text-primary',
  mo: 'text-primary',
};

// BR-UI: Nút 4 biến thể y mobile — chinh/phu/vien/mo
export const NutBam: FC<NutBamProps> = ({
  tieuDe,
  khiBam,
  bienThe = 'chinh',
  voHieuHoa = false,
  dangTai = false,
  className = '',
  loai = 'button',
}) => {
  const tat = voHieuHoa || dangTai;
  return (
    <button
      type={loai}
      disabled={tat}
      onClick={khiBam}
      className={`flex items-center justify-center rounded-xl px-4 py-3 ${MAU_NEN[bienThe]} ${
        tat ? 'opacity-50' : ''
      } ${className}`}
    >
      {dangTai ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <span className={`text-base font-semibold ${MAU_CHU[bienThe]}`}>{tieuDe}</span>
      )}
    </button>
  );
};
