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
