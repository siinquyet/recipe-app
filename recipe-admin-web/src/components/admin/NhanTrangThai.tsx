import type { FC } from 'react';
import { tenTrangThai } from '@cook/shared';

const MAU: Record<string, string> = {
  APPROVED: 'bg-teal-100 text-teal-800',
  ACTIVE: 'bg-teal-100 text-teal-800',
  RESOLVED: 'bg-teal-100 text-teal-800',
  PENDING: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-slate-200 text-slate-700',
  REJECTED: 'bg-red-100 text-red-700',
  BANNED: 'bg-red-100 text-red-700',
  HIDDEN: 'bg-slate-200 text-slate-600',
  ADMIN: 'bg-ink text-white',
  USER: 'bg-slate-200 text-slate-700',
};

const NHAN_VI: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  DRAFT: 'Nháp',
  HIDDEN: 'Đang ẩn',
  ACTIVE: 'Hoạt động',
  BANNED: 'Bị khóa',
  RESOLVED: 'Đã xử lý',
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Duyệt',
  REJECT: 'Từ chối',
  HIDE: 'Ẩn',
  UNHIDE: 'Hiện',
  BAN_USER: 'Khóa user',
  ACTIVATE_USER: 'Mở khóa',
  CHANGE_ROLE: 'Đổi role',
  SYNC_REFERENCE: 'Đồng bộ',
  RESOLVE_REPORT: 'Xử lý tố cáo',
};

// BR-ADM: Badge trạng thái dùng chung — chữ tiếng Việt + màu theo mức độ,
// thay cho mã thô (PENDING, BANNED...) rải rác các bảng
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
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${MAU[ma] ?? 'bg-slate-200 text-slate-700'}`}>
      {nhan}
    </span>
  );
};
