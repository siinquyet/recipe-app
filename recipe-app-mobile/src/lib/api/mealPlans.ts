import type { ApiResponse, DanhSachTrang, KeHoachAn } from '../../types/api';
import { KICH_THUOC_TRANG_MAC_DINH } from '../../constants/cau-hinh';
import { apiClient, goiApi } from './client';
import { danhSachTrangSchema, keHoachAnSchema } from './schemas';

const danhSachKeHoachSchema = danhSachTrangSchema(keHoachAnSchema);

export interface TaoKeHoachAnPayload {
  ten: string;
  ngayBatDau: string;
  ngayKetThuc: string;
}

export interface ThemMonVaoKeHoachPayload {
  congThucId: string;
  ngay: string;
  buoiAn: string;
  khauPhan: number;
}

export async function layDanhSachKeHoachAn(
  page = 0,
  size = KICH_THUOC_TRANG_MAC_DINH,
): Promise<DanhSachTrang<KeHoachAn>> {
  const duLieu = await goiApi(
    apiClient
      .get('meal-plans', { searchParams: { page, size } })
      .json<ApiResponse<DanhSachTrang<KeHoachAn>>>(),
  );
  return danhSachKeHoachSchema.parse(duLieu);
}

export async function layChiTietKeHoachAn(id: string): Promise<KeHoachAn> {
  const duLieu = await goiApi(apiClient.get(`meal-plans/${id}`).json<ApiResponse<KeHoachAn>>());
  return keHoachAnSchema.parse(duLieu);
}

export async function taoKeHoachAn(payload: TaoKeHoachAnPayload): Promise<KeHoachAn> {
  const duLieu = await goiApi(
    apiClient.post('meal-plans', { json: payload }).json<ApiResponse<KeHoachAn>>(),
  );
  return keHoachAnSchema.parse(duLieu);
}

export async function capNhatKeHoachAn(
  id: string,
  payload: Partial<TaoKeHoachAnPayload>,
): Promise<KeHoachAn> {
  const duLieu = await goiApi(
    apiClient.patch(`meal-plans/${id}`, { json: payload }).json<ApiResponse<KeHoachAn>>(),
  );
  return keHoachAnSchema.parse(duLieu);
}

export async function xoaKeHoachAn(id: string): Promise<void> {
  await goiApi(apiClient.delete(`meal-plans/${id}`).json<ApiResponse<unknown>>());
}

// BR-MEAL: Thêm món vào kế hoạch có sẵn
export async function themMonVaoKeHoach(
  keHoachId: string,
  payload: ThemMonVaoKeHoachPayload,
): Promise<unknown> {
  return goiApi(
    apiClient.post(`meal-plans/${keHoachId}/items`, { json: payload }).json<ApiResponse<unknown>>(),
  );
}
