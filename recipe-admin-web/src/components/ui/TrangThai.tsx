import type { FC, ReactNode } from 'react';
import { NutBam } from './NutBam';
import { CaptionText } from './VanBan';

export const TrangDangTai: FC<{ nhan?: string }> = ({ nhan = 'Đang tải...' }) => (
  <div className="flex flex-col gap-3 p-4" aria-busy="true">
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-200" />
    ))}
    <CaptionText>{nhan}</CaptionText>
  </div>
);

export const TrangLoi: FC<{ loi: string; khiThuLai?: () => void }> = ({ loi, khiThuLai }) => (
  <div className="p-4">
    <p className="text-left text-danger">{loi}</p>
    {khiThuLai ? <NutBam tieuDe="Thử lại" bienThe="vien" khiBam={khiThuLai} className="mt-3" /> : null}
  </div>
);

export const TrangTrong: FC<{ nhan: string; hanhDong?: ReactNode }> = ({ nhan, hanhDong }) => (
  <div className="p-8 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cream">
      <span className="text-3xl font-bold text-accent">?</span>
    </div>
    <p className="mt-4 text-left text-neutral-500 sm:text-center">{nhan}</p>
    {hanhDong}
  </div>
);
