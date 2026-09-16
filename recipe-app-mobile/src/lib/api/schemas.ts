import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.string().optional(),
});

export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    error: apiErrorSchema.nullable(),
  });
}

export const nguoiDungSchema = z.object({
  id: z.string(),
  email: z.string(),
  tenHienThi: z.string(),
  anhDaiDien: z.string().nullable(),
  vaiTro: z.string(),
  trangThai: z.string(),
});

export const nguyenLieuSchema = z.object({
  ten: z.string(),
  dinhLuong: z.string(),
  donVi: z.string(),
});

export const buocNauAnSchema = z.object({
  thuTu: z.number(),
  noiDung: z.string(),
  anhBuoc: z.string().nullable(),
});

export const dinhDuongSchema = z.object({
  calo: z.number(),
  protein: z.string(),
  carb: z.string(),
  chatBeo: z.string(),
});

export const congThucSchema = z.object({
  id: z.string(),
  ten: z.string(),
  moTa: z.string().nullable(),
  anhThumbnail: z.string().nullable(),
  thoiGianNauPhut: z.number(),
  thoiGianChuanBiPhut: z.number().nullable(),
  khauPhan: z.number(),
  tacGia: nguoiDungSchema,
  nguyenLieu: z.array(nguyenLieuSchema),
  cacBuoc: z.array(buocNauAnSchema),
  dinhDuong: dinhDuongSchema.nullable(),
  ngayTao: z.string(),
  ngayCapNhat: z.string(),
});

export const danhSachTrangSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    noiDung: z.array(itemSchema),
    tongSoPhanTu: z.number(),
    tongSoTrang: z.number(),
  });

export const dangNhapResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  thoiGianHetHan: z.number(),
});

export const binhLuanSchema = z.object({
  id: z.string(),
  noiDung: z.string(),
  tacGia: nguoiDungSchema,
  thoiGianTao: z.string(),
  soLuongPhanHoi: z.number(),
});

export const monTrongKeHoachSchema = z.object({
  id: z.string(),
  ngay: z.string(),
  loaiBuoiAn: z.string(),
  khauPhan: z.number(),
  thuTu: z.number(),
  congThuc: congThucSchema.nullable(),
});

export const keHoachAnSchema = z.object({
  id: z.string(),
  ten: z.string(),
  ngayBatDau: z.string(),
  ngayKetThuc: z.string(),
  kichHoat: z.boolean(),
  cacMon: z.array(monTrongKeHoachSchema),
});

export const monDiChoSchema = z.object({
  id: z.string(),
  nguyenLieuId: z.string().nullable(),
  tenGoc: z.string(),
  dinhLuong: z.string(),
  donVi: z.string(),
  daChon: z.boolean(),
  thuTu: z.number(),
});

export const danhSachDiChoSchema = z.object({
  id: z.string(),
  ten: z.string(),
  loaiNguon: z.string(),
  nguonId: z.string().nullable(),
  trangThai: z.string(),
  cacMon: z.array(monDiChoSchema),
});
