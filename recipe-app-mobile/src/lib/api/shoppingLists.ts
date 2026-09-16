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
