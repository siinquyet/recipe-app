import type { FC } from 'react';
import { tenTrangThai } from '@cook/shared';

const MAU: Record<string, string> = {
  APPROVED: 'bg-deepteal text-white',
  ACTIVE: 'bg-accent-light/60 text-ink',
  RESOLVED: 'bg-deepteal text-white',
  PENDING: 'bg-cream text-ink',
  DRAFT: 'bg-mist text-slate-600',
  REJECTED: 'bg-danger/10 text-danger',
  BANNED: 'bg-danger/10 text-danger',
  HIDDEN: 'bg-mist text-slate-500',
  ADMIN: 'bg-ink text-white',
  USER: 'bg-mist text-slate-600',
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
