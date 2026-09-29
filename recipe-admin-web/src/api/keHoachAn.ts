import { userApiClient } from './userClient';

export interface MonTrongKeHoach {
  id: string;
  ngay: string;
  loaiBuoiAn: string;
  khauPhan: number;
  congThuc: { id: string; ten: string; anhThumbnail: string | null } | null;
}
export interface KeHoachAn {
  id: string;
  ten: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  cacMon: MonTrongKeHoach[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

function nemLoi(prefix: string, body: { success: boolean; error: { code: string; message: string } | null }): Error {
  return new Error(`[${body.error?.code ?? prefix}] ${body.error?.message ?? 'Không tải được'}`);
}

// BR-MEAL: Danh sách + chi tiết kế hoạch (đọc); tạo mới (POST có backend)
export async function layDanhSachKeHoachAn(trang = 0, kichThuoc = 20) {
  const res = await userApiClient.get('/meal-plans', { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<{ noiDung: KeHoachAn[]; tongSoPhanTu: number; tongSoTrang: number }>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

export async function layChiTietKeHoachAn(id: string): Promise<KeHoachAn> {
  const res = await userApiClient.get(`/meal-plans/${id}`);
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

export async function taoKeHoachAn(payload: { ten: string; ngayBatDau: string; ngayKetThuc: string }): Promise<KeHoachAn> {
  const res = await userApiClient.post('/meal-plans', payload);
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

// BR-MEAL: Sửa tên/khoảng ngày kế hoạch
export async function capNhatKeHoachAn(
  id: string,
  payload: { ten?: string; ngayBatDau?: string; ngayKetThuc?: string },
): Promise<KeHoachAn> {
  const res = await userApiClient.patch(`/meal-plans/${id}`, payload);
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

// BR-MEAL: Xóa kế hoạch (kéo theo món)
export async function xoaKeHoachAn(id: string): Promise<void> {
  await userApiClient.delete(`/meal-plans/${id}`);
}

// BR-MEAL: Thêm món vào kế hoạch
export async function themMonVaoKeHoach(
  keHoachId: string,
  payload: { congThucId: string; ngay: string; buoiAn: string; khauPhan: number },
): Promise<KeHoachAn> {
  const res = await userApiClient.post(`/meal-plans/${keHoachId}/items`, payload);
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

// BR-MEAL: Sửa khẩu phần món trong kế hoạch
export async function capNhatMonTrongKeHoach(
  keHoachId: string,
  monId: string,
  khauPhan: number,
): Promise<KeHoachAn> {
  const res = await userApiClient.patch(`/meal-plans/${keHoachId}/items/${monId}`, { khauPhan });
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}

// BR-MEAL: Xóa món khỏi kế hoạch
export async function xoaMonKhoiKeHoach(keHoachId: string, monId: string): Promise<KeHoachAn> {
  const res = await userApiClient.delete(`/meal-plans/${keHoachId}/items/${monId}`);
  const body = res.data as ApiEnvelope<KeHoachAn>;
  if (!body.success) throw nemLoi('MEAL-00', body);
  return body.data;
}
