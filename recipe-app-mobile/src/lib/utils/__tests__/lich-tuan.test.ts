import { buoiGoiYTheoGio, congNgay, homNay, nhanThuNgan, nhomMonTheoNgay, tenThuTiengViet } from '../lich-tuan';
import type { MonTrongKeHoach } from '../../../types/api';

function taoMon(id: string, ngay: string, loaiBuoiAn: string, ten = 'Phở'): MonTrongKeHoach {
  return {
    id,
    ngay,
    loaiBuoiAn,
    khauPhan: 2,
    thuTu: 0,
    congThuc: { id: `ct-${id}`, ten, anhThumbnail: null },
  };
}

describe('nhomMonTheoNgay', () => {
  it('tra ve du ngay trong khoang ke ca ngay trong', () => {
    const ketQua = nhomMonTheoNgay([taoMon('1', '2026-09-02', 'LUNCH')], '2026-09-01', '2026-09-03');

    expect(ketQua.map((n) => n.ngay)).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    expect(ketQua[1].cacBuoi.find((b) => b.ma === 'LUNCH')?.mon).toHaveLength(1);
    expect(ketQua[0].cacBuoi.every((b) => b.mon.length === 0)).toBe(true);
  });

  it('bo mon ngoai khoang ngay', () => {
    const ketQua = nhomMonTheoNgay([taoMon('1', '2026-09-10', 'DINNER')], '2026-09-01', '2026-09-02');

    expect(ketQua).toHaveLength(2);
    expect(ketQua.every((n) => n.cacBuoi.every((b) => b.mon.length === 0))).toBe(true);
  });
});

describe('tien ich ngay cho cum chon mon', () => {
  it('tenThuTiengViet tra dung thu', () => {
    expect(tenThuTiengViet('2026-09-07')).toBe('Thứ Hai');
    expect(tenThuTiengViet('2026-09-13')).toBe('Chủ nhật');
    expect(tenThuTiengViet('khong-phai-ngay')).toBe('');
  });

  it('nhanThuNgan viet tat CN/T2-T7', () => {
    expect(nhanThuNgan('2026-09-13')).toBe('CN');
    expect(nhanThuNgan('2026-09-07')).toBe('T2');
    expect(nhanThuNgan('2026-09-12')).toBe('T7');
  });

  it('congNgay qua thang van dung dinh dang', () => {
    expect(congNgay('2026-09-30', 1)).toBe('2026-10-01');
    expect(congNgay('2026-09-05', -5)).toBe('2026-08-31');
  });

  it('homNay dung dinh dang YYYY-MM-DD', () => {
    expect(homNay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('buoiGoiYTheoGio theo khung gio', () => {
    expect(buoiGoiYTheoGio(7)).toBe('BREAKFAST');
    expect(buoiGoiYTheoGio(12)).toBe('LUNCH');
    expect(buoiGoiYTheoGio(19)).toBe('DINNER');
    expect(buoiGoiYTheoGio(22)).toBe('BREAKFAST');
  });
});
