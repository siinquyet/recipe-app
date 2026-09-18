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

export interface CongThuc {
  id: string;
  ten: string;
  moTa: string | null;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  thoiGianChuanBiPhut: number | null;
  khauPhan: number;
  tacGia: TacGia;
  nguyenLieu: NguyenLieu[];
  cacBuoc: BuocNau[];
  dinhDuong: { calo: number; protein: string; carb: string; chatBeo: string } | null;
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
  tacGia: { tenHienThi: string };
  thoiGianTao: string;
  soLuongPhanHoi: number;
}

// BR-SOC: Đánh giá sao + bình luận theo đúng API backend
export async function danhGiaCongThucUser(id: string, diem: number): Promise<void> {
  await userApiClient.post(`/recipes/${id}/rating`, { diem });
}

export async function layBinhLuanUser(id: string, trang = 0, kichThuoc = 20) {
  const res = await userApiClient.get(`/recipes/${id}/comments`, { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<{ noiDung: BinhLuan[]; tongSoPhanTu: number; tongSoTrang: number }>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function taoBinhLuanUser(id: string, noiDung: string): Promise<BinhLuan> {
  const res = await userApiClient.post(`/recipes/${id}/comments`, { noiDung });
  const body = res.data as ApiEnvelope<BinhLuan>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}
