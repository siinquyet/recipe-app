/**
 * Nhan tieng Viet cho cac trang thai trong Prisma schema.
 *
 * Tach rieng khoi component de:
 * - test duoc khong can render DOM,
 * - cac trang thai cua DB duoc doi ten o MOT noi duy nhat, khong phai sua
 *   o tung page (truoc day co 3 ban StatusBadge trung nhau, mau khac nhau).
 *
 * Nguon: recipe-backend-api/prisma/schema.prisma
 */

export type StatusTone = 'gray' | 'yellow' | 'green' | 'red' | 'blue';

export interface StatusMeta {
  /** Nhan tieng Viet hien thi cho quan tri vien. */
  label: string;
  /** Mau nen/chu cho badge. */
  tone: StatusTone;
}

export const STATUS_META: Record<string, StatusMeta> = {
  // enum RecipeStatus
  DRAFT: { label: 'Nháp', tone: 'gray' },
  PENDING: { label: 'Chờ duyệt', tone: 'yellow' },
  APPROVED: { label: 'Đã duyệt', tone: 'green' },
  REJECTED: { label: 'Từ chối', tone: 'red' },
  HIDDEN: { label: 'Đã ẩn', tone: 'blue' },

  // enum ReferenceStatus
  ACTIVE: { label: 'Đang hoạt động', tone: 'green' },
  UNAVAILABLE: { label: 'Không khả dụng', tone: 'gray' },

  // User.status (truong String trong schema, gia tri ACTIVE | BANNED)
  BANNED: { label: 'Đã khóa', tone: 'red' },

  // enum ReportStatus
  RESOLVED: { label: 'Đã xử lý', tone: 'green' },

  // enum ShoppingListStatus
  COMPLETED: { label: 'Đã hoàn thành', tone: 'green' },
  ARCHIVED: { label: 'Đã lưu trữ', tone: 'gray' },

  // enum IngredientMappingStatus
  MAPPED: { label: 'Đã ánh xạ', tone: 'green' },
  UNMAPPED: { label: 'Chưa ánh xạ', tone: 'yellow' },
};

/**
 * Lay nhan cua mot trang thai.
 *
 * Trang thai la (chua biet) thi tra ve chinh chuoi goc o dang xam, de admin
 * van nhin thay thay vi thay bang chu rong - thuong la du lieu sai hon la
 * che giu.
 */
export function resolveStatus(status: string | null | undefined): StatusMeta {
  if (status == null) return { label: '', tone: 'gray' };
  const key = String(status).trim().toUpperCase();
  return STATUS_META[key] ?? { label: String(status), tone: 'gray' };
}
