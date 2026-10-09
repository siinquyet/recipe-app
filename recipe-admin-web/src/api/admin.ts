import { apiClient } from './client';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

function nemLoi(prefix: string, body: { success: boolean; error: { code: string; message: string } | null }): Error {
  return new Error(`[${body.error?.code ?? prefix}] ${body.error?.message ?? 'Không tải được'}`);
}

export interface NguoiDungAdmin {
  id: string;
  email: string;
  tenHienThi: string;
  anhDaiDien: string | null;
  vaiTro: string;
  trangThai: string;
  soBaiViet: number;
  ngayTao: string;
}

export interface TrangNguoiDung {
  noiDung: NguoiDungAdmin[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

export interface CanhBaoDoc {
  muc: string;
  cap: [string, string];
  lyDo: string;
}

export interface GoiYKiemDuyet {
  diemTuDong?: number;
  nhanGoiY?: 'nen-duyet' | 'giu-lai' | 'nen-tu-choi';
  lyDoGoiY?: string[];
}

export interface BaiAdmin {
  id: string;
  ten: string;
  moTa: string | null;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  khauPhan: number;
  trangThai: string;
  lyDoTuChoi: string | null;
  canhBao?: CanhBaoDoc[];
  // BR-ADM-AUTO: Điểm + nhãn gợi ý từ pipeline (chế độ gợi ý: admin vẫn bấm tay)
  diemTuDong?: number;
  nhanGoiY?: GoiYKiemDuyet['nhanGoiY'];
  lyDoGoiY?: string[];
  tacGia: { id: string; tenHienThi: string; email: string };
  ngayTao: string;
}

export interface TrangBaiAdmin {
  noiDung: BaiAdmin[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

export interface DongTop {
  id: string;
  ten: string;
  diemTrungBinh: number;
  tongDanhGia: number;
}

export interface DiemTangTruong {
  ngay: string;
  soLuong: number;
}

export interface Dashboard {
  tongNguoiDung: number;
  dangHoatDong: number;
  baiChoDuyet: number;
  baiDaDuyet: number;
  topDanhGia: DongTop[];
  tangTruongNguoiDung: DiemTangTruong[];
  tangTruongCongThuc: DiemTangTruong[];
  tuongTac?: { tongYeuThich: number; tongDanhGia: number; tongBinhLuan: number };
}

// BR-ADM: Đăng nhập quản trị — token riêng khóa admin_access_token
export async function dangNhapAdmin(email: string, matKhau: string): Promise<void> {
  const res = await apiClient.post('/auth/login', { email, matKhau });
  const body = res.data as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
  if (!body.success) throw nemLoi('AUTH-01', body);
  localStorage.setItem('admin_access_token', body.data.accessToken);
  localStorage.setItem('admin_refresh_token', body.data.refreshToken);
}

export function dangXuatAdmin(): void {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
}

// BR-ADM: Số liệu tổng quan dashboard
export async function layDashboard(): Promise<Dashboard> {
  const res = await apiClient.get('/admin/analytics/dashboard');
  const body = res.data as ApiEnvelope<Dashboard>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

// BR-ADM: Hàng chờ duyệt
export async function layBaiChoDuyet(trang = 0, kichThuoc = 20): Promise<TrangBaiAdmin> {
  const res = await apiClient.get('/admin/recipes/pending', { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<TrangBaiAdmin>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

// BR-ADM: Tất cả bài viết, lọc theo trạng thái
export async function layTatCaBai(trang = 0, kichThuoc = 20, trangThai?: string): Promise<TrangBaiAdmin> {
  const res = await apiClient.get('/admin/recipes', {
    params: { page: trang, size: kichThuoc, ...(trangThai ? { status: trangThai } : {}) },
  });
  const body = res.data as ApiEnvelope<TrangBaiAdmin>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export async function duyetBai(id: string): Promise<void> {
  await apiClient.post(`/admin/recipes/${id}/approve`);
}

export async function tuChoiBai(id: string, lyDo: string): Promise<void> {
  await apiClient.post(`/admin/recipes/${id}/reject`, { lyDo });
}

export async function anBai(id: string): Promise<void> {
  await apiClient.post(`/admin/recipes/${id}/hide`);
}

export async function hienBai(id: string): Promise<void> {
  await apiClient.post(`/admin/recipes/${id}/unhide`);
}

// BR-ADM-AUTO: Chạy pipeline kiểm duyệt trên hàng chờ + hoàn tác quyết định
export async function chayKiemDuyetTuDong(): Promise<{
  tong: number;
  daDuyet: number;
  daTuChoi: number;
  giuLai: number;
  cheDoTuDong: boolean;
}> {
  const res = await apiClient.post('/admin/recipes/kiem-duyet-tu-dong');
  const body = res.data as ApiEnvelope<{
    tong: number;
    daDuyet: number;
    daTuChoi: number;
    giuLai: number;
    cheDoTuDong: boolean;
  }>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export async function hoanTacQuyetDinh(id: string): Promise<void> {
  await apiClient.post(`/admin/recipes/${id}/hoan-tac`);
}

export interface BaoCao {
  id: string;
  lyDo: string;
  trangThai: string;
  ghiChuAdmin: string | null;
  nguoiBaoCao: { id: string; email: string; tenHienThi: string };
  congThuc: { id: string; ten: string } | null;
  binhLuan: { id: string; noiDung: string } | null;
  ngayTao: string;
}

export interface TrangBaoCao {
  noiDung: BaoCao[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

// BR-SOC: Tố cáo vi phạm — admin xử lý tập trung
export async function layBaoCao(trang = 0, kichThuoc = 20, trangThai?: string): Promise<TrangBaoCao> {
  const res = await apiClient.get('/reports', {
    params: { page: trang, size: kichThuoc, ...(trangThai ? { status: trangThai } : {}) },
  });
  const body = res.data as ApiEnvelope<TrangBaoCao>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export type HanhDongXuLy = 'KHONG' | 'AN_BAI' | 'XOA_BINH_LUAN';

export async function xuLyBaoCao(
  id: string,
  trangThai: 'RESOLVED' | 'REJECTED',
  ghiChu?: string,
  hanhDong?: HanhDongXuLy,
): Promise<void> {
  await apiClient.patch(`/reports/${id}/resolve`, {
    trangThai,
    ...(ghiChu ? { ghiChu } : {}),
    ...(hanhDong && hanhDong !== 'KHONG' ? { hanhDong } : {}),
  });
}

export interface DongNhatKy {
  id: string;
  hanhDong: string;
  loaiThucThe: string;
  thucTheId: string;
  duLieuCu: unknown;
  duLieuMoi: unknown;
  nguoiLam: { id: string; email: string; tenHienThi: string };
  ngayTao: string;
}

export interface TrangNhatKy {
  noiDung: DongNhatKy[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

// BR-05: Nhật ký kiểm toán — ai làm gì, khi nào
export async function layNhatKy(trang = 0, kichThuoc = 20, hanhDong?: string): Promise<TrangNhatKy> {
  const res = await apiClient.get('/admin/nhat-ky', {
    params: { page: trang, size: kichThuoc, ...(hanhDong ? { action: hanhDong } : {}) },
  });
  const body = res.data as ApiEnvelope<TrangNhatKy>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export interface DanhMuc {
  id: string;
  ten: string;
  slug: string;
  soBaiViet?: number;
}

export interface NhanBai {
  id: string;
  ten: string;
  slug: string;
}

// BR-ADM: Danh mục + nhãn — admin quản lý để món gắn chuẩn
export async function layDanhMuc(): Promise<DanhMuc[]> {
  const res = await apiClient.get('/categories');
  const body = res.data as ApiEnvelope<DanhMuc[]>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export async function taoDanhMuc(ten: string): Promise<void> {
  await apiClient.post('/categories', { ten });
}

export async function xoaDanhMuc(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function layNhan(): Promise<NhanBai[]> {
  const res = await apiClient.get('/tags');
  const body = res.data as ApiEnvelope<NhanBai[]>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export async function taoNhan(ten: string): Promise<void> {
  await apiClient.post('/tags', { ten });
}

export async function xoaNhan(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}

// BR-ADM: Quản lý người dùng
export async function layNguoiDung(
  trang = 0,
  kichThuoc = 20,
  tuKhoa?: string,
  trangThai?: string,
): Promise<TrangNguoiDung> {
  const res = await apiClient.get('/admin/users', {
    params: {
      page: trang,
      size: kichThuoc,
      ...(tuKhoa ? { search: tuKhoa } : {}),
      ...(trangThai ? { status: trangThai } : {}),
    },
  });
  const body = res.data as ApiEnvelope<TrangNguoiDung>;
  if (!body.success) throw nemLoi('ADM-00', body);
  return body.data;
}

export async function khoaNguoiDung(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/ban`);
}

export async function moKhoaNguoiDung(id: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/activate`);
}

export async function doiRole(id: string, role: 'USER' | 'ADMIN'): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/role`, { role });
}

// BR-ADM: Xóa bình luận vi phạm
export async function xoaBinhLuanAdmin(binhLuanId: string): Promise<void> {
  await apiClient.delete(`/admin/comments/${binhLuanId}`);
}
