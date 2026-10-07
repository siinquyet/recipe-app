import { userApiClient } from './userClient';

export interface TacGia {
  id: string;
  tenHienThi: string;
  anhDaiDien?: string | null;
}

export interface NguyenLieu {
  ten: string;
  dinhLuong: string;
  donVi: string;
}

export interface BuocNau {
  thuTu: number;
  noiDung: string;
  anhBuoc: string | null;
}

export interface CanhBaoDoc {
  muc: string;
  cap: [string, string];
  lyDo: string;
}

export interface CongThuc {
  id: string;
  ten: string;
  moTa: string | null;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  thoiGianChuanBiPhut: number | null;
  khauPhan: number;
  trangThai: string;
  tacGia: TacGia;
  nguyenLieu: NguyenLieu[];
  cacBuoc: BuocNau[];
  dinhDuong: { calo: number; protein: string; carb: string; chatBeo: string } | null;
  canhBao?: CanhBaoDoc[];
  ngayTao: string;
}

export interface TrangCongThuc {
  noiDung: CongThuc[];
  tongSoPhanTu: number;
  tongSoTrang: number;
}

export const KICH_THUOC = 10;

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

function nemLoi(body: { success: boolean; error: { code: string; message: string } | null }): Error {
  return new Error(`[${body.error?.code ?? 'REC-00'}] ${body.error?.message ?? 'Không tải được'}`);
}

// BR-REC: Đúng shape backend đã có — params Anh, key Việt
export async function layDanhSachCongThucUser(thamSo: {
  trang?: number;
  kichThuoc?: number;
  tuKhoa?: string;
  sapXep?: string;
  tacGiaId?: string;
}): Promise<TrangCongThuc> {
  const res = await userApiClient.get('/recipes', {
    params: {
      page: thamSo.trang ?? 0,
      size: thamSo.kichThuoc ?? KICH_THUOC,
      ...(thamSo.tuKhoa ? { search: thamSo.tuKhoa } : {}),
      ...(thamSo.sapXep ? { sort: thamSo.sapXep } : {}),
      ...(thamSo.tacGiaId ? { tacGiaId: thamSo.tacGiaId } : {}),
    },
  });
  const body = res.data as ApiEnvelope<TrangCongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function layChiTietCongThucUser(id: string): Promise<CongThuc> {
  const res = await userApiClient.get(`/recipes/${id}`);
  const body = res.data as ApiEnvelope<CongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function layCongThucTuongTuUser(id: string): Promise<TrangCongThuc> {
  const res = await userApiClient.get(`/recipes/${id}/similar`);
  const body = res.data as ApiEnvelope<TrangCongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-FORK: Fork riêng tư món cộng đồng — món gốc giữ nguyên, không qua duyệt
export async function forkCongThucUser(id: string): Promise<CongThuc> {
  const res = await userApiClient.post(`/recipes/${id}/fork`);
  const body = res.data as ApiEnvelope<CongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-FORK: Bản riêng tư của chính mình từ món cộng đồng (null nếu chưa fork)
export async function layBanCaNhanUser(id: string): Promise<CongThuc | null> {
  const res = await userApiClient.get(`/recipes/${id}/ban-ca-nhan`);
  const body = res.data as ApiEnvelope<CongThuc | null>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SOC: Toggle yêu thích theo đúng API mobile
export async function themYeuThichUser(id: string): Promise<void> {
  await userApiClient.post(`/recipes/${id}/favorite`);
}

export async function xoaYeuThichUser(id: string): Promise<void> {
  await userApiClient.delete(`/recipes/${id}/favorite`);
}

export async function layDanhSachYeuThichUser(trang = 0, kichThuoc = 50): Promise<TrangCongThuc> {
  const res = await userApiClient.get('/favorites', { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<TrangCongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export interface BinhLuan {
  id: string;
  noiDung: string;
  tacGia: { id?: string; tenHienThi: string };
  thoiGianTao: string;
  soLuongPhanHoi: number;
}

export interface TomTatDanhGia {
  diemTrungBinh: number;
  tongSoDanhGia: number;
  phanBo: Record<string, number>;
}

// BR-SOC: Đánh giá sao + tổng quan thật + bình luận theo đúng API backend
export async function danhGiaCongThucUser(id: string, diem: number): Promise<void> {
  await userApiClient.post(`/recipes/${id}/rating`, { diem });
}

export async function layTomTatDanhGiaUser(id: string): Promise<TomTatDanhGia> {
  const res = await userApiClient.get(`/recipes/${id}/rating/summary`);
  const body = res.data as ApiEnvelope<TomTatDanhGia>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function layBinhLuanUser(id: string, trang = 0, kichThuoc = 20) {
  const res = await userApiClient.get(`/recipes/${id}/comments`, { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<{ noiDung: BinhLuan[]; tongSoPhanTu: number; tongSoTrang: number }>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function taoBinhLuanUser(id: string, noiDung: string, chaId?: string): Promise<BinhLuan> {
  const res = await userApiClient.post(`/recipes/${id}/comments`, { noiDung, ...(chaId ? { chaId } : {}) });
  const body = res.data as ApiEnvelope<BinhLuan>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SOC: Trả lời/sửa/xóa bình luận + xem phản hồi
export async function layPhanHoiUser(recipeId: string, commentId: string) {
  const res = await userApiClient.get(`/recipes/${recipeId}/comments/${commentId}/replies`);
  const body = res.data as ApiEnvelope<{ noiDung: BinhLuan[]; tongSoPhanTu: number; tongSoTrang: number }>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function suaBinhLuanUser(recipeId: string, commentId: string, noiDung: string): Promise<BinhLuan> {
  const res = await userApiClient.patch(`/recipes/${recipeId}/comments/${commentId}`, { noiDung });
  const body = res.data as ApiEnvelope<BinhLuan>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function xoaBinhLuanUser(recipeId: string, commentId: string): Promise<void> {
  const res = await userApiClient.delete(`/recipes/${recipeId}/comments/${commentId}`);
  const body = res.data as ApiEnvelope<unknown>;
  if (!body.success) throw nemLoi(body);
}

// BR-SOC: Tố cáo bài viết/bình luận vi phạm
export async function baoCaoViPham(payload: { recipeId?: string; commentId?: string; reason: string }): Promise<void> {
  const res = await userApiClient.post('/reports', payload);
  const body = res.data as ApiEnvelope<unknown>;
  if (!body.success) throw nemLoi(body);
}

// BR-UREC: Gửi duyệt bài nháp/bị từ chối lên hàng chờ PENDING
export async function guiDuyetCongThucUser(id: string): Promise<CongThuc> {
  const res = await userApiClient.post(`/recipes/${id}/submit-review`);
  const body = res.data as ApiEnvelope<CongThuc>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}
