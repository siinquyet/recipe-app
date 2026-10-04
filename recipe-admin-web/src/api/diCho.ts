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

export async function taoDiChoTuKeHoach(mealPlanId: string, tuNgay?: string, denNgay?: string): Promise<DanhSachDiCho> {
  const res = await userApiClient.post('/shopping-lists/generate-from-meal-plan', {
    mealPlanId,
    ...(tuNgay ? { tuNgay } : {}),
    ...(denNgay ? { denNgay } : {}),
  });
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SHOP: Sinh danh sách đi chợ từ 1 công thức (nút Thêm hết vào giỏ)
export async function taoDiChoTuCongThuc(congThucId: string, khauPhan?: number): Promise<DanhSachDiCho> {
  const res = await userApiClient.post('/shopping-lists/generate-from-recipe', {
    congThucId,
    ...(khauPhan ? { khauPhan } : {}),
  });
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SHOP: Tạo danh sách thủ công
export async function taoDanhSachDiCho(ten: string): Promise<DanhSachDiCho> {
  const res = await userApiClient.post('/shopping-lists', { ten, loaiNguon: 'MANUAL' });
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SHOP: Xóa (archive) danh sách
export async function xoaDanhSachDiCho(id: string): Promise<void> {
  await userApiClient.delete(`/shopping-lists/${id}`);
}

// BR-SHOP: Thêm món thủ công vào danh sách
export async function themMonDiCho(
  listId: string,
  payload: { tenGoc: string; dinhLuong: number; donVi: string },
): Promise<DanhSachDiCho> {
  const res = await userApiClient.post(`/shopping-lists/${listId}/items`, payload);
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SHOP: Sửa tên/lượng/đơn vị/tick món
export async function suaMonDiCho(
  listId: string,
  itemId: string,
  payload: { tenGoc?: string; dinhLuong?: number; donVi?: string; daChon?: boolean },
): Promise<DanhSachDiCho> {
  const res = await userApiClient.patch(`/shopping-lists/${listId}/items/${itemId}`, payload);
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}

// BR-SHOP: Xóa món khỏi danh sách
export async function xoaMonDiCho(listId: string, itemId: string): Promise<DanhSachDiCho> {
  const res = await userApiClient.delete(`/shopping-lists/${listId}/items/${itemId}`);
  const body = res.data as ApiEnvelope<DanhSachDiCho>;
  if (!body.success) throw nemLoi(body);
  return body.data;
}
