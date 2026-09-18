import { userApiClient } from './userClient';

export interface MonDiCho {
  id: string;
  nguyenLieuId: string | null;
  tenGoc: string;
  dinhLuong: string;
  donVi: string;
  daChon: boolean;
}

export interface DanhSachDiCho {
  id: string;
  ten: string;
  nguonId: string | null;
  cacMon: MonDiCho[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
}

function nemLoi(body: { success: boolean; error: { code: string; message: string } | null }): Error {
  return new Error(`[${body.error?.code ?? 'SHOP-00'}] ${body.error?.message ?? 'Không tải được'}`);
}

// BR-SHOP: Danh sách + chi tiết + tick đã mua (persist server) + sinh từ kế hoạch
export async function layDanhSachDiCho(trang = 0, kichThuoc = 20) {
  const res = await userApiClient.get('/shopping-lists', { params: { page: trang, size: kichThuoc } });
  const body = res.data as ApiEnvelope<{ noiDung: DanhSachDiCho[]; tongSoPhanTu: number; tongSoTrang: number }>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function layChiTietDiCho(id: string): Promise<DanhSachDiCho> {
  const res = await userApiClient.get(`/shopping-lists/${id}`);
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function chuyenTrangThaiMon(listId: string, itemId: string, daChon: boolean): Promise<DanhSachDiCho> {
  const res = await userApiClient.patch(`/shopping-lists/${listId}/items/${itemId}`, { daChon });
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

export async function taoDiChoTuKeHoach(mealPlanId: string): Promise<DanhSachDiCho> {
  const res = await userApiClient.post('/shopping-lists/generate-from-meal-plan', { mealPlanId });
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}
