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

export interface BaiAdmin {
  id: string;
  ten: string;
  moTa: string | null;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  khauPhan: number;
  trangThai: string;
  lyDoTuChoi: string | null;
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
