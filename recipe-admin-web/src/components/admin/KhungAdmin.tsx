import type { FC, ReactNode } from 'react';
import { formatVn } from '@cook/shared';

// BR-ADM: Khung editorial dùng chung trang quản trị — tiêu đề serif, thẻ 40px,
// bảng chữ nhỏ, chip lọc pill, đúng DESIGN.md Vietnamese Culinary Editorial

export const TieuDeTrang: FC<{ tieuDe: string; moTa?: string; benPhai?: ReactNode }> = ({
  tieuDe,
  moTa,
  benPhai,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-left font-serif text-3xl font-black tracking-tight text-ink">{tieuDe}</h1>
      {moTa ? <p className="mt-1 text-left text-sm text-muted">{moTa}</p> : null}
    </div>
    {benPhai}
  </div>
);

export const TheAdmin: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mt-4 overflow-hidden rounded-40px bg-white p-5 shadow-magazine md:p-6 ${className}`}>
    {children}
  </div>
);

export const BangAdmin: FC<{ tieuDeCot: ReactNode; hang: ReactNode }> = ({ tieuDeCot, hang }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-mist">{tieuDeCot}</tr>
      </thead>
      <tbody>{hang}</tbody>
    </table>
  </div>
);

export const OTieuDe: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted ${className}`}>
    {children}
  </th>
);

export const ODuLieu: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`border-t border-mist px-3 py-3 align-top ${className}`}>{children}</td>
);

export const ChipLoc: FC<{ chon: boolean; khiBam: () => void; children: ReactNode }> = ({
  chon,
  khiBam,
  children,
}) => (
  <button
    type="button"
    onClick={khiBam}
    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
      chon
        ? 'border-accent bg-accent text-ink'
        : 'border-muted/30 bg-white text-slate-600 hover:border-accent'
    }`}
  >
    {children}
  </button>
);

export const PhanTrang: FC<{
  trang: number;
  tongTrang: number;
  tongSo: number;
  donVi: string;
  lui: () => void;
  toi: () => void;
}> = ({ trang, tongTrang, tongSo, donVi, lui, toi }) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
    <p className="text-left text-sm text-muted">
      Trang {tongTrang === 0 ? 0 : trang + 1}/{formatVn(tongTrang)} • {formatVn(tongSo)} {donVi}
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        disabled={trang === 0}
        onClick={lui}
        className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
      >
        Trước
      </button>
      <button
        type="button"
        disabled={trang + 1 >= tongTrang}
        onClick={toi}
        className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  </div>
);

export const NutDuyet: FC<{ tat?: boolean; khiBam: () => void }> = ({ tat, khiBam }) => (
  <button
    type="button"
    disabled={tat}
    onClick={khiBam}
    className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
  >
    Duyệt
  </button>
);

export const NutTuChoi: FC<{ tat?: boolean; khiBam: () => void; children?: ReactNode }> = ({
  tat,
  khiBam,
  children = 'Từ chối',
}) => (
  <button
    type="button"
    disabled={tat}
    onClick={khiBam}
    className="rounded-xl border-[1.5px] border-danger/40 bg-white px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-50"
  >
    {children}
  </button>
);
