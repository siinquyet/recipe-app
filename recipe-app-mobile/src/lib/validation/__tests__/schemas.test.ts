import {
  dangKySchema,
  dangNhapSchema,
  taoCongThucSchema,
  taoKeHoachAnSchema,
} from '../schemas';

describe('validation schemas', () => {
  describe('dangNhapSchema', () => {
    it('chấp nhận email + mật khẩu hợp lệ', () => {
      expect(
        dangNhapSchema.safeParse({ email: 'an@example.com', matKhau: 'MatKhau123' }).success,
      ).toBe(true);
    });

    it('từ chối email sai và mật khẩu ngắn', () => {
      const kq = dangNhapSchema.safeParse({ email: 'sai', matKhau: 'ngan' });
      expect(kq.success).toBe(false);
    });
  });

  describe('dangKySchema', () => {
    it('yêu cầu mật khẩu có hoa + thường + số', () => {
      expect(
        dangKySchema.safeParse({ email: 'an@example.com', matKhau: 'matkhau123', tenHienThi: 'An' })
          .success,
      ).toBe(false);
      expect(
        dangKySchema.safeParse({ email: 'an@example.com', matKhau: 'MatKhau123', tenHienThi: 'An' })
          .success,
      ).toBe(true);
    });

    it('từ chối tên hiển thị quá ngắn', () => {
      const kq = dangKySchema.safeParse({ email: 'an@example.com', matKhau: 'MatKhau123', tenHienThi: 'A' });
      expect(kq.success).toBe(false);
    });
  });

  describe('taoCongThucSchema', () => {
    const hopLe = {
      ten: 'Phở bò',
      thoiGianNauPhut: 120,
      khauPhan: 4,
      nguyenLieu: [{ ten: 'Thịt bò', dinhLuong: 500, donVi: 'g' }],
      cacBuoc: [{ noiDung: 'Ninh xương' }],
    };

    it('chấp nhận công thức hợp lệ', () => {
      expect(taoCongThucSchema.safeParse(hopLe).success).toBe(true);
    });

    it('từ chối khi thiếu nguyên liệu hoặc bước', () => {
      expect(taoCongThucSchema.safeParse({ ...hopLe, nguyenLieu: [] }).success).toBe(false);
      expect(taoCongThucSchema.safeParse({ ...hopLe, cacBuoc: [] }).success).toBe(false);
    });

    it('từ chối khẩu phần ngoài 1-100', () => {
      expect(taoCongThucSchema.safeParse({ ...hopLe, khauPhan: 0 }).success).toBe(false);
    });
  });

  describe('taoKeHoachAnSchema', () => {
    it('yêu cầu đủ tên và ngày', () => {
      expect(
        taoKeHoachAnSchema.safeParse({ ten: 'T', ngayBatDau: '', ngayKetThuc: '' }).success,
      ).toBe(false);
      expect(
        taoKeHoachAnSchema.safeParse({
          ten: 'Tuần 1',
          ngayBatDau: '2026-09-01',
          ngayKetThuc: '2026-09-07',
        }).success,
      ).toBe(true);
    });
  });
});
