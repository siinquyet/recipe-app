// BR-ADM: Tên tiếng Việt cho trạng thái công thức, BE giữ enum tiếng Anh
export const NHAN_TRANG_THAI: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  HIDDEN: 'Đã ẩn',
};

export function tenTrangThai(ma: string): string {
  if (!ma) return 'Tất cả';
  return NHAN_TRANG_THAI[ma] ?? ma;
}
