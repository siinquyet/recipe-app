// BR-AUTH/BR-UREC/BR-SOC/BR-MEAL/BR-SHOP: Kiểu dữ liệu mirror backend NestJS (response interceptor { success, data, error })

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface DanhSachTrang<T> {
  noiDung: T[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

export interface NguoiDung {
  id: string;
  email: string;
  tenHienThi: string;
  anhDaiDien: string | null;
  vaiTro: string;
  trangThai: string;
}

export interface NguyenLieuCongThuc {
  ten: string;
  dinhLuong: string;
  donVi: string;
}

export interface BuocNauAn {
  thuTu: number;
  noiDung: string;
  anhBuoc: string | null;
}

export interface DinhDuong {
  calo: number;
  protein: string;
  carb: string;
  chatBeo: string;
}

export interface CongThuc {
  id: string;
  ten: string;
  moTa: string | null;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  thoiGianChuanBiPhut: number | null;
  khauPhan: number;
  tacGia: NguoiDung;
  nguyenLieu: NguyenLieuCongThuc[];
  cacBuoc: BuocNauAn[];
  dinhDuong: DinhDuong | null;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DangNhapResponse {
  accessToken: string;
  refreshToken: string;
  thoiGianHetHan: number;
}

export interface BinhLuan {
  id: string;
  noiDung: string;
  tacGia: NguoiDung;
  thoiGianTao: string;
  soLuongPhanHoi: number;
}

export interface MonTrongKeHoach {
  id: string;
  ngay: string;
  loaiBuoiAn: string;
  khauPhan: number;
  thuTu: number;
  congThuc: CongThucTomTat | null;
}

// BR-MEAL: Món trong kế hoạch chỉ mang tên + ảnh, đủ để hiển thị lịch tuần
export interface CongThucTomTat {
  id: string;
  ten: string;
  anhThumbnail: string | null;
}

export interface KeHoachAn {
  id: string;
  ten: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  kichHoat: boolean;
  cacMon: MonTrongKeHoach[];
}

export interface MonTrongDanhSachDiCho {
  id: string;
  nguyenLieuId: string | null;
  tenGoc: string;
  dinhLuong: string;
  donVi: string;
  daChon: boolean;
  thuTu: number;
}

export interface DanhSachDiCho {
  id: string;
  ten: string;
  loaiNguon: string;
  nguonId: string | null;
  trangThai: string;
  cacMon: MonTrongDanhSachDiCho[];
}

export interface DanhGiaResponse {
  diemTrungBinh: number;
  tongSoDanhGia: number;
}
