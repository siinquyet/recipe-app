import { nhomMonTheoNgay } from '../lich-tuan';
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
