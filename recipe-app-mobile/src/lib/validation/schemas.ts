import { z } from 'zod';

// BR-AUTH: Khớp RegisterDto/LoginDto backend (email, matKhau, tenHienThi)
export const dangNhapSchema = z.object({
  email: z.string().email('AUTH-00 Email không hợp lệ'),
  matKhau: z.string().min(8, 'AUTH-00 Mật khẩu tối thiểu 8 ký tự'),
});

export type DangNhapForm = z.infer<typeof dangNhapSchema>;

export const dangKySchema = z.object({
  email: z.string().email('AUTH-00 Email không hợp lệ'),
  matKhau: z
    .string()
    .min(8, 'AUTH-05 Mật khẩu tối thiểu 8 ký tự')
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'AUTH-05 Mật khẩu phải có chữ hoa, chữ thường và số'),
  tenHienThi: z
    .string()
    .min(2, 'AUTH-00 Tên hiển thị tối thiểu 2 ký tự')
    .max(50, 'AUTH-00 Tên hiển thị tối đa 50 ký tự'),
});

export type DangKyForm = z.infer<typeof dangKySchema>;

// BR-UREC: Khớp TaoCongThucDto backend
export const nguyenLieuMoiSchema = z.object({
  ten: z.string().min(1, 'REC-00 Tên nguyên liệu không được trống').max(200),
  dinhLuong: z.number({ invalid_type_error: 'REC-00 Định lượng phải là số' }).min(0),
  donVi: z.string().max(20),
});

export const buocMoiSchema = z.object({
  noiDung: z.string().min(1, 'REC-00 Nội dung bước không được trống'),
});

export const taoCongThucSchema = z.object({
  ten: z.string().min(2, 'REC-00 Tên công thức tối thiểu 2 ký tự').max(200),
  moTa: z.string().max(2000).optional(),
  anhThumbnail: z.string().max(500).optional(),
  thoiGianNauPhut: z.number().int().min(1).max(1440),
  thoiGianChuanBiPhut: z.number().int().min(0).max(1440).optional(),
  khauPhan: z.number().int().min(1).max(100),
  nguyenLieu: z.array(nguyenLieuMoiSchema).min(1, 'REC-00 Cần ít nhất 1 nguyên liệu'),
  cacBuoc: z.array(buocMoiSchema).min(1, 'REC-00 Cần ít nhất 1 bước thực hiện'),
});

export type TaoCongThucForm = z.infer<typeof taoCongThucSchema>;

export const taoKeHoachAnSchema = z.object({
  ten: z.string().min(2, 'MEAL-00 Tên kế hoạch tối thiểu 2 ký tự'),
  ngayBatDau: z.string().min(1, 'MEAL-00 Chưa chọn ngày bắt đầu'),
  ngayKetThuc: z.string().min(1, 'MEAL-00 Chưa chọn ngày kết thúc'),
});

export type TaoKeHoachAnForm = z.infer<typeof taoKeHoachAnSchema>;
