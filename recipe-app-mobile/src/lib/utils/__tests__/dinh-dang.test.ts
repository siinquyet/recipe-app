import { dinhDangNgay, dinhDangNgayGio, formatVn, parseVn, tinhStt } from '../dinh-dang';

describe('dinh-dang', () => {
  describe('formatVn (shared)', () => {
    it('định dạng số nguyên kiểu Việt Nam', () => {
      expect(formatVn(1000)).toBe('1.000');
      expect(formatVn(100000)).toBe('100.000');
      expect(formatVn(1500000)).toBe('1.500.000');
      expect(formatVn(0)).toBe('0');
    });

    it('hỗ trợ số âm', () => {
      expect(formatVn(-5000)).toBe('-5.000');
    });
  });

  describe('parseVn (shared)', () => {
    it('phân tích chuỗi Việt Nam về số', () => {
      expect(parseVn('1.000')).toBe(1000);
      expect(parseVn('100.000')).toBe(100000);
    });
  });

  describe('dinhDangNgay', () => {
    it('định dạng DD/MM/YYYY', () => {
      expect(dinhDangNgay('2026-08-25T10:00:00.000Z')).toMatch(/^\d{2}\/\d{2}\/2026$/);
      expect(dinhDangNgay(new Date(2026, 0, 5))).toBe('05/01/2026');
    });

    it('trả về chuỗi rỗng khi ngày không hợp lệ', () => {
      expect(dinhDangNgay('khong-phai-ngay')).toBe('');
    });
  });

  describe('dinhDangNgayGio', () => {
    it('định dạng HH:mm DD/MM/YYYY', () => {
      expect(dinhDangNgayGio(new Date(2026, 0, 5, 9, 7))).toBe('09:07 05/01/2026');
    });

    it('trả về chuỗi rỗng khi ngày không hợp lệ', () => {
      expect(dinhDangNgayGio('abc')).toBe('');
    });
  });

  describe('tinhStt', () => {
    it('tính STT = index + 1 + page * size', () => {
      expect(tinhStt(0, 0, 10)).toBe(1);
      expect(tinhStt(4, 0, 10)).toBe(5);
      expect(tinhStt(0, 2, 10)).toBe(21);
    });
  });
});
