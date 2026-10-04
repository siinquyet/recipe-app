"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sangYyyyMmDd = sangYyyyMmDd;
exports.homNayYyyyMmDd = homNayYyyyMmDd;
exports.congNgayYyyyMmDd = congNgayYyyyMmDd;
exports.dauTuanNayYyyyMmDd = dauTuanNayYyyyMmDd;
exports.cuoiTuanNayYyyyMmDd = cuoiTuanNayYyyyMmDd;
// BR-MEAL/BR-SHOP: Ngày YYYY-MM-DD dùng chung web/mobile (pure, không phụ thuộc platform)
function sangYyyyMmDd(ngay) {
    const mm = String(ngay.getMonth() + 1).padStart(2, '0');
    const dd = String(ngay.getDate()).padStart(2, '0');
    return `${ngay.getFullYear()}-${mm}-${dd}`;
}
function homNayYyyyMmDd() {
    return sangYyyyMmDd(new Date());
}
function congNgayYyyyMmDd(ngayYyyyMmDd, soNgay) {
    const d = new Date(`${ngayYyyyMmDd}T00:00:00`);
    if (Number.isNaN(d.getTime()))
        return ngayYyyyMmDd;
    d.setDate(d.getDate() + soNgay);
    return sangYyyyMmDd(d);
}
// BR-MEAL: Thứ Hai và Chủ nhật tuần này để preset khoảng khỏi gõ ngày
function dauTuanNayYyyyMmDd() {
    const d = new Date();
    const thu = d.getDay();
    d.setDate(d.getDate() - (thu === 0 ? 6 : thu - 1));
    return sangYyyyMmDd(d);
}
function cuoiTuanNayYyyyMmDd() {
    return congNgayYyyyMmDd(dauTuanNayYyyyMmDd(), 6);
}
