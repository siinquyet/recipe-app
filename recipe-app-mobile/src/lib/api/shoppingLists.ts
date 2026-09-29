import type { ApiResponse, DanhSachDiCho, DanhSachTrang } from '../../types/api';
import { KICH_THUOC_TRANG_MAC_DINH } from '../../constants/cau-hinh';
import { apiClient, goiApi } from './client';
import { danhSachDiChoSchema, danhSachTrangSchema } from './schemas';

const danhSachDiChoTrangSchema = danhSachTrangSchema(danhSachDiChoSchema);

export interface TaoDanhSachDiChoPayload {
  ten: string;
  loaiNguon: string;
  nguonId?: string;
}

export async function layDanhSachDiCho(
  page = 0,
  size = KICH_THUOC_TRANG_MAC_DINH,
): Promise<DanhSachTrang<DanhSachDiCho>> {
  const duLieu = await goiApi(
    apiClient
      .get('shopping-lists', { searchParams: { page, size } })
      .json<ApiResponse<DanhSachTrang<DanhSachDiCho>>>(),
  );
  return danhSachDiChoTrangSchema.parse(duLieu);
}

export async function taoDanhSachDiCho(payload: TaoDanhSachDiChoPayload): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient.post('shopping-lists', { json: payload }).json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

export async function layChiTietDanhSachDiCho(id: string): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(apiClient.get(`shopping-lists/${id}`).json<ApiResponse<DanhSachDiCho>>());
  return danhSachDiChoSchema.parse(duLieu);
}

// BR-SHOP + BR-03/BR-04: Sinh danh sách đi chợ từ kế hoạch ăn (server gộp + scale)
export async function taoTuKeHoachAn(mealPlanId: string): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient
      .post('shopping-lists/generate-from-meal-plan', { json: { mealPlanId } })
      .json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

// BR-SHOP: Sinh danh sách đi chợ từ 1 công thức (server gộp + scale theo khẩu phần)
export async function taoTuCongThuc(congThucId: string, khauPhan?: number): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient
      .post('shopping-lists/generate-from-recipe', { json: { congThucId, ...(khauPhan ? { khauPhan } : {}) } })
      .json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

export interface CapNhatDanhSachDiChoPayload {
  ten?: string;
  trangThai?: string;
}

// BR-SHOP: Đổi tên / chuyển trạng thái danh sách (ACTIVE, COMPLETED, ARCHIVED)
export async function capNhatDanhSachDiCho(
  id: string,
  payload: CapNhatDanhSachDiChoPayload,
): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient.patch(`shopping-lists/${id}`, { json: payload }).json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

// BR-SHOP: Xóa (archive) danh sách đi chợ
export async function xoaDanhSachDiCho(id: string): Promise<void> {
  await goiApi(apiClient.delete(`shopping-lists/${id}`).json<ApiResponse<unknown>>());
}

export interface MonDiChoMoi {
  tenGoc: string;
  dinhLuong: number;
  donVi: string;
  nguyenLieuId?: string;
}

export interface SuaMonDiChoPayload {
  tenGoc?: string;
  dinhLuong?: number;
  donVi?: string;
}

// BR-SHOP: Thêm món thủ công vào danh sách
export async function themMonDiCho(listId: string, payload: MonDiChoMoi): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient.post(`shopping-lists/${listId}/items`, { json: payload }).json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

// BR-SHOP: Sửa tên/lượng/đơn vị món trong danh sách
export async function suaMonDiCho(
  listId: string,
  itemId: string,
  payload: SuaMonDiChoPayload,
): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient
      .patch(`shopping-lists/${listId}/items/${itemId}`, { json: payload })
      .json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}

// BR-SHOP: Xóa món khỏi danh sách
export async function xoaMonDiCho(listId: string, itemId: string): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient.delete(`shopping-lists/${listId}/items/${itemId}`).json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}
// BR-SHOP: Đánh dấu đã mua/bỏ chọn — persist server, mobile optimistic update
export async function capNhatTrangThaiMon(
  listId: string,
  itemId: string,
  daChon: boolean,
): Promise<DanhSachDiCho> {
  const duLieu = await goiApi(
    apiClient
      .patch(`shopping-lists/${listId}/items/${itemId}`, { json: { daChon } })
      .json<ApiResponse<DanhSachDiCho>>(),
  );
  return danhSachDiChoSchema.parse(duLieu);
}
