import type { FC, ReactNode } from "react";
import { formatVn } from "@cook/shared";

// BR-ADM: Khung enterprise dùng chung trang quản trị — Inter, thẻ trắng radius-lg, shadow-sm

export const TieuDeTrang: FC<{
  tieuDe: string;
  moTa?: string;
  benPhai?: ReactNode;
}> = ({ tieuDe, moTa, benPhai }) => (
  <div className="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-left text-2xl font-semibold tracking-tight text-enterprise-text">
        {tieuDe}
      </h1>
      {moTa ? (
        <p className="mt-1 text-left text-sm text-enterprise-subtle">{moTa}</p>
      ) : null}
    </div>
    {benPhai}
  </div>
);

export const TheAdmin: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`mt-4 overflow-hidden rounded-xl border border-enterprise-border bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover md:p-6 ${className}`}
  >
    {children}
  </div>
);

export const BangAdmin: FC<{ tieuDeCot: ReactNode; hang: ReactNode }> = ({
  tieuDeCot,
  hang,
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-enterprise-border">{tieuDeCot}</tr>
      </thead>
      <tbody>{hang}</tbody>
    </table>
  </div>
);

export const OTieuDe: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <th
    className={`px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-widest text-enterprise-subtle ${className}`}
  >
    {children}
  </th>
);

export const ODuLieu: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <td
    className={`border-t border-enterprise-border px-3 py-3 align-top ${className}`}
  >
    {children}
  </td>
);

export const ChipLoc: FC<{
  chon: boolean;
  khiBam: () => void;
  children: ReactNode;
}> = ({ chon, khiBam, children }) => (
  <button
    type="button"
    onClick={khiBam}
    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition duration-150 ${
      chon
        ? "border-primary bg-primary text-white"
        : "border-enterprise-border bg-white text-enterprise-subtle hover:border-primary hover:text-primary"
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
    <p className="font-mono-vn text-left text-sm text-enterprise-subtle">
      Trang {tongTrang === 0 ? 0 : trang + 1}/{formatVn(tongTrang)} •{" "}
      {formatVn(tongSo)} {donVi}
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        disabled={trang === 0}
        onClick={lui}
        className="rounded-lg border border-enterprise-border bg-white px-4 py-2 text-sm font-semibold text-enterprise-text transition duration-150 hover:border-primary hover:text-primary disabled:opacity-40"
      >
        Trước
      </button>
      <button
        type="button"
        disabled={trang + 1 >= tongTrang}
        onClick={toi}
        className="rounded-lg border border-enterprise-border bg-white px-4 py-2 text-sm font-semibold text-enterprise-text transition duration-150 hover:border-primary hover:text-primary disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  </div>
);

export const NutDuyet: FC<{ tat?: boolean; khiBam: () => void }> = ({
  tat,
  khiBam,
}) => (
  <button
    type="button"
    disabled={tat}
    onClick={khiBam}
    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-primary-dark disabled:opacity-50"
  >
    Duyệt
  </button>
);

export const NutTuChoi: FC<{
  tat?: boolean;
  khiBam: () => void;
  children?: ReactNode;
}> = ({ tat, khiBam, children = "Từ chối" }) => (
  <button
    type="button"
    disabled={tat}
    onClick={khiBam}
    className="rounded-lg border border-danger/40 bg-white px-4 py-2 text-sm font-semibold text-danger transition duration-150 hover:bg-danger/5 disabled:opacity-50"
  >
    {children}
  </button>
);
