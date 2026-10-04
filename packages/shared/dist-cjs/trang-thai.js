"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NHAN_TRANG_THAI = void 0;
exports.tenTrangThai = tenTrangThai;
// BR-ADM: Tên tiếng Việt cho trạng thái công thức, BE giữ enum tiếng Anh
exports.NHAN_TRANG_THAI = {
    DRAFT: 'Nháp',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Bị từ chối',
    HIDDEN: 'Đã ẩn',
};
function tenTrangThai(ma) {
    if (!ma)
        return 'Tất cả';
    return exports.NHAN_TRANG_THAI[ma] ?? ma;
}
