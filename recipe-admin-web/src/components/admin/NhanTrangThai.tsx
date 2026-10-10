import type { FC } from "react";
import { tenTrangThai } from "@cook/shared";

const MAU: Record<string, string> = {
  APPROVED: "bg-green-50 text-success",
  ACTIVE: "bg-primary-light text-primary",
  RESOLVED: "bg-green-50 text-success",
  PENDING: "bg-amber-50 text-amber-600",
  DRAFT: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-50 text-danger",
  BANNED: "bg-red-50 text-danger",
  HIDDEN: "bg-slate-100 text-slate-500",
  ADMIN: "bg-enterprise-sidebar text-white",
  USER: "bg-slate-100 text-slate-600",
};

const NHAN_VI: Record<string, string> = {
  PENDING: "Chờ xử lý",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
  DRAFT: "Nháp",
  HIDDEN: "Đang ẩn",
  ACTIVE: "Hoạt động",
  BANNED: "Bị khóa",
  RESOLVED: "Đã xử lý",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  HIDE: "Ẩn",
  UNHIDE: "Hiện",
  BAN_USER: "Khóa user",
  ACTIVATE_USER: "Mở khóa",
  CHANGE_ROLE: "Đổi role",
  SYNC_REFERENCE: "Đồng bộ",
  RESOLVE_REPORT: "Xử lý tố cáo",
};

// BR-ADM: Badge trạng thái dùng chung — chữ tiếng Việt + màu theo mức độ
export const NhanTrangThai: FC<{ ma: string }> = ({ ma }) => {
  let nhan = NHAN_VI[ma];
  if (!nhan) {
    try {
      nhan = tenTrangThai(ma);
    } catch {
      nhan = ma;
    }
  }
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${MAU[ma] ?? "bg-slate-100 text-slate-600"}`}
    >
      {nhan}
    </span>
  );
};
