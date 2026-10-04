"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DON_VI_CHUAN = exports.MOC_DINH_LUONG = void 0;
exports.mocChoGiaTri = mocChoGiaTri;
// BR-03: Mốc định lượng + đơn vị dùng chung web/mobile
exports.MOC_DINH_LUONG = [
    { nhan: '0,1 – 1', min: 0.1, max: 1, buoc: 0.1 },
    { nhan: '1 – 10', min: 1, max: 10, buoc: 0.5 },
    { nhan: '10 – 100', min: 10, max: 100, buoc: 1 },
    { nhan: '100 – 1.000', min: 100, max: 1000, buoc: 5 },
];
exports.DON_VI_CHUAN = [
    'g',
    'kg',
    'ml',
    'lít',
    'muỗng canh',
    'muỗng cà phê',
    'quả',
    'củ',
    'gói',
    'nhúm',
];
function mocChoGiaTri(giaTri) {
    // BR-03: Biên nửa mở [min, max) để giá trị biên (1, 10, 100) rơi đúng mốc trên
    let chon = 0;
    exports.MOC_DINH_LUONG.forEach((m, i) => {
        if (giaTri >= m.min)
            chon = i;
    });
    return chon;
}
