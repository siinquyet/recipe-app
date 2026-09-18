import type {
  ApiResponse,
  BinhLuan,
  CongThuc,
  DanhGiaResponse,
  DanhSachTrang,
} from '../../types/api';
import { KICH_THUOC_TRANG_MAC_DINH } from '../../constants/cau-hinh';
import { apiClient, goiApi } from './client';
import { binhLuanSchema, congThucSchema, danhSachTrangSchema } from './schemas';

const danhSachCongThucSchema = danhSachTrangSchema(congThucSchema);

export interface ThamSoDanhSachCongThuc {
  page?: number;
  size?: number;
  search?: string;
  tacGiaId?: string;
  category?: string;
  cuisine?: string;
  diet?: string;
  minCookTime?: number;
  maxCookTime?: number;
  servings?: number;
  sort?: string;
}

export interface NguyenLieuMoi {
  ten: string;
  dinhLuong: number;
  donVi: string;
}

export interface BuocMoi {
  noiDung: string;
}

export interface TaoCongThucPayload {
  ten: string;
  moTa?: string;
  anhThumbnail?: string;
  thoiGianNauPhut: number;
  thoiGianChuanBiPhut?: number;
  khauPhan: number;
  nguyenLieu: NguyenLieuMoi[];
  cacBuoc: BuocMoi[];
}

export async function layDanhSachCongThuc(
  thamSo: ThamSoDanhSachCongThuc = {},
): Promise<DanhSachTrang<CongThuc>> {
  const duLieu = await goiApi(
    apiClient
      .get('recipes', {
        searchParams: {
          page: thamSo.page ?? 0,
          size: thamSo.size ?? KICH_THUOC_TRANG_MAC_DINH,
          ...(thamSo.search ? { search: thamSo.search } : {}),
          ...(thamSo.tacGiaId ? { tacGiaId: thamSo.tacGiaId } : {}),
          ...(thamSo.category ? { category: thamSo.category } : {}),
          ...(thamSo.cuisine ? { cuisine: thamSo.cuisine } : {}),
          ...(thamSo.diet ? { diet: thamSo.diet } : {}),
          ...(thamSo.minCookTime !== undefined ? { minCookTime: thamSo.minCookTime } : {}),
          ...(thamSo.maxCookTime !== undefined ? { maxCookTime: thamSo.maxCookTime } : {}),
          ...(thamSo.servings !== undefined ? { servings: thamSo.servings } : {}),
          ...(thamSo.sort ? { sort: thamSo.sort } : {}),
        },
      })
      .json<ApiResponse<DanhSachTrang<CongThuc>>>(),
  );
  return danhSachCongThucSchema.parse(duLieu);
}

export async function layChiTietCongThuc(id: string): Promise<CongThuc> {
  const duLieu = await goiApi(apiClient.get(`recipes/${id}`).json<ApiResponse<CongThuc>>());
  return congThucSchema.parse(duLieu);
}

export async function layCongThucTuongTu(id: string): Promise<DanhSachTrang<CongThuc>> {
  const duLieu = await goiApi(
    apiClient.get(`recipes/${id}/similar`).json<ApiResponse<DanhSachTrang<CongThuc>>>(),
  );
  return danhSachCongThucSchema.parse(duLieu);
}

export async function timKiemTheoNguyenLieu(
  nguyenLieu: string,
  soLuong = 10,
): Promise<DanhSachTrang<CongThuc>> {
  const duLieu = await goiApi(
    apiClient
      .get('recipes/search/by-ingredients', { searchParams: { ingredients: nguyenLieu, number: soLuong } })
      .json<ApiResponse<DanhSachTrang<CongThuc>>>(),
  );
  return danhSachCongThucSchema.parse(duLieu);
}

// BR-UREC: Tạo/sửa/xóa công thức cá nhân
export async function taoCongThuc(payload: TaoCongThucPayload): Promise<CongThuc> {
  const duLieu = await goiApi(
    apiClient.post('recipes', { json: payload }).json<ApiResponse<CongThuc>>(),
  );
  return congThucSchema.parse(duLieu);
}

export async function capNhatCongThuc(
  id: string,
  payload: Partial<TaoCongThucPayload>,
): Promise<CongThuc> {
  const duLieu = await goiApi(
    apiClient.patch(`recipes/${id}`, { json: payload }).json<ApiResponse<CongThuc>>(),
  );
  return congThucSchema.parse(duLieu);
}

export async function xoaCongThuc(id: string): Promise<void> {
  await goiApi(apiClient.delete(`recipes/${id}`).json<ApiResponse<unknown>>());
}

// BR-SOC: Yêu thích / đánh giá / bình luận
export async function themYeuThich(id: string): Promise<void> {
  await goiApi(apiClient.post(`recipes/${id}/favorite`).json<ApiResponse<unknown>>());
}

// BR-SOC: Danh sách công thức đã yêu thích của chính người dùng
export async function layDanhSachYeuThich(
  thamSo: { page?: number; size?: number } = {},
): Promise<DanhSachTrang<CongThuc>> {
  const duLieu = await goiApi(
    apiClient
      .get('favorites', {
        searchParams: {
          page: thamSo.page ?? 0,
          size: thamSo.size ?? KICH_THUOC_TRANG_MAC_DINH,
        },
      })
      .json<ApiResponse<DanhSachTrang<CongThuc>>>(),
  );
  return danhSachCongThucSchema.parse(duLieu);
}

export async function xoaYeuThich(id: string): Promise<void> {
  await goiApi(apiClient.delete(`recipes/${id}/favorite`).json<ApiResponse<unknown>>());
}

export async function danhGiaCongThuc(id: string, diem: number): Promise<DanhGiaResponse> {
  return goiApi(
    apiClient.post(`recipes/${id}/rating`, { json: { diem } }).json<ApiResponse<DanhGiaResponse>>(),
  );
}

export async function layBinhLuan(
  id: string,
  page = 0,
  size = 20,
): Promise<DanhSachTrang<BinhLuan>> {
  const duLieu = await goiApi(
    apiClient
      .get(`recipes/${id}/comments`, { searchParams: { page, size } })
      .json<ApiResponse<DanhSachTrang<BinhLuan>>>(),
  );
  return danhSachTrangSchema(binhLuanSchema).parse(duLieu);
}

export async function taoBinhLuan(
  id: string,
  noiDung: string,
  chaId?: string,
): Promise<BinhLuan> {
  const duLieu = await goiApi(
    apiClient
      .post(`recipes/${id}/comments`, { json: { noiDung, ...(chaId ? { chaId } : {}) } })
      .json<ApiResponse<BinhLuan>>(),
  );
  return binhLuanSchema.parse(duLieu);
}
