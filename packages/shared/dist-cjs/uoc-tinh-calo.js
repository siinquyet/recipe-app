"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uocTinhCalo = uocTinhCalo;
const canh_bao_doc_1 = require("./canh-bao-doc");
// BR-DINHDUONG: Tự ước tính calo khi món không nhập dinh dưỡng — số gần đúng,
// không thay thế đo lường chuẩn. Bảng kcal/100g cho nguyên liệu phổ biến VN.
const KCAL_MOI_100G = [
    { khoa: ['thit heo', 'thit ba chi', 'ba roi'], kcal: 250 },
    { khoa: ['thit bo'], kcal: 250 },
    { khoa: ['thit ga', 'uc ga', 'dui ga'], kcal: 150 },
    { khoa: ['ca loc', 'ca chep', 'ca dieu hong'], kcal: 100 },
    { khoa: ['ca thu', 'ca hoi'], kcal: 180 },
    { khoa: ['tom', 'tep'], kcal: 100 },
    { khoa: ['muc', 'bach tuoc'], kcal: 90 },
    { khoa: ['trung ga', 'trung vit', 'trung'], kcal: 155 },
    { khoa: ['dau phu', 'tau hu'], kcal: 80 },
    { khoa: ['gao', 'nep'], kcal: 360 },
    { khoa: ['bun tuoi', 'bun'], kcal: 110 },
    { khoa: ['banh mi'], kcal: 270 },
    { khoa: ['mi tom', 'mi goi'], kcal: 450 },
    { khoa: ['bot mi', 'bot san', 'bot nang', 'bot gao'], kcal: 350 },
    { khoa: ['rau muong'], kcal: 20 },
    { khoa: ['cai ngot', 'cai thia', 'rau cai'], kcal: 15 },
    { khoa: ['ca chua'], kcal: 20 },
    { khoa: ['dua leo', 'dua chuot'], kcal: 15 },
    { khoa: ['hanh tay'], kcal: 40 },
    { khoa: ['khoai tay'], kcal: 80 },
    { khoa: ['khoai lang'], kcal: 85 },
    { khoa: ['nam rom', 'nam meo', 'nam'], kcal: 25 },
    { khoa: ['dau xanh', 'do xanh'], kcal: 340 },
    { khoa: ['lac', 'dau phong'], kcal: 570 },
    { khoa: ['duong'], kcal: 400 },
    { khoa: ['mat ong'], kcal: 300 },
    { khoa: ['dau an'], kcal: 880 },
    { khoa: ['nuoc mam'], kcal: 60 },
    { khoa: ['muoi'], kcal: 0 },
    { khoa: ['tieu'], kcal: 250 },
    { khoa: ['toi'], kcal: 150 },
    { khoa: ['ot'], kcal: 40 },
    { khoa: ['sa'], kcal: 100 },
    { khoa: ['gung'], kcal: 80 },
    { khoa: ['sua dac'], kcal: 320 },
    { khoa: ['sua tuoi', 'sua'], kcal: 60 },
    { khoa: ['bo', 'bo thuc vat'], kcal: 720 },
    { khoa: ['cha lua', 'gio lua'], kcal: 150 },
    { khoa: ['xuc xich'], kcal: 280 },
];
// Trọng lượng ước tính cho đơn vị đếm (gram/1 đơn vị), tra theo tên
const GAM_MOI_DON_VI_DEM = [
    { khoa: ['trung'], gam: 50 },
    { khoa: ['sa'], gam: 20 },
    { khoa: ['ot'], gam: 5 },
    { khoa: ['chanh', 'tac'], gam: 50 },
    { khoa: ['hanh tim', 'hanh'], gam: 50 },
    { khoa: ['toi'], gam: 30 },
    { khoa: ['ca chua'], gam: 100 },
    { khoa: ['khoai'], gam: 150 },
    { khoa: ['bap', 'ngo'], gam: 200 },
    { khoa: ['dua leo'], gam: 200 },
    { khoa: ['mi goi', 'mi tom'], gam: 75 },
];
function timKcal(tenChuan) {
    for (const dong of KCAL_MOI_100G) {
        if (dong.khoa.some((k) => tenChuan.includes(k)))
            return dong.kcal;
    }
    return null;
}
function doiRaGam(tenChuan, dinhLuong, donVi) {
    // BR-DINHDUONG: Đơn vị có dấu (củ, lít, quả) phải chuẩn hóa trước khi so
    const dv = (0, canh_bao_doc_1.chuanHoaTen)(donVi);
    if (dv === 'g')
        return dinhLuong;
    if (dv === 'kg')
        return dinhLuong * 1000;
    if (dv === 'ml')
        return dinhLuong;
    if (dv === 'lit')
        return dinhLuong * 1000;
    if (dv === 'muong canh')
        return dinhLuong * 15;
    if (dv === 'muong ca phe')
        return dinhLuong * 5;
    if (dv === 'nhum')
        return dinhLuong * 2;
    if (dv === 'goi')
        return dinhLuong * 75;
    if (dv === 'qua' || dv === 'cu' || dv === 'trai') {
        for (const dong of GAM_MOI_DON_VI_DEM) {
            if (dong.khoa.some((k) => tenChuan.includes(k)))
                return dinhLuong * dong.gam;
        }
        return null;
    }
    return null;
}
function uocTinhCalo(nguyenLieu) {
    let tong = 0;
    for (const nl of nguyenLieu) {
        const tenChuan = (0, canh_bao_doc_1.chuanHoaTen)(nl.ten);
        const kcal = timKcal(tenChuan);
        const gam = doiRaGam(tenChuan, Number(nl.dinhLuong) || 0, nl.donVi);
        if (kcal === null || gam === null)
            continue;
        tong += (kcal * gam) / 100;
    }
    return Math.round(tong);
}
