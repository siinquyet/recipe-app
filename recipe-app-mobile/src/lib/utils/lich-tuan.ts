import type { MonTrongKeHoach } from '../../types/api';

export interface BuoiTrongNgay {
  ma: string;
  nhan: string;
  mon: MonTrongKeHoach[];
}

export interface NgayTrongTuan {
  ngay: string;
  cacBuoi: BuoiTrongNgay[];
}

// BR-MEAL: Thứ tự buổi cố định Sáng → Trưa → Tối → Phụ để render lịch tuần
export const CAC_BUOI_AN = [
  { ma: 'BREAKFAST', nhan: 'Sáng' },
  { ma: 'LUNCH', nhan: 'Trưa' },
  { ma: 'DINNER', nhan: 'Tối' },
  { ma: 'SNACK', nhan: 'Phụ' },
] as const;

const SO_NGAY_TOI_DA = 31;

function sangYyyyMmDd(ngay: Date): string {
  const mm = String(ngay.getMonth() + 1).padStart(2, '0');
  const dd = String(ngay.getDate()).padStart(2, '0');
  return `${ngay.getFullYear()}-${mm}-${dd}`;
}

// BR-MEAL: Nhóm món theo từng ngày trong khoảng kế hoạch, giữ cả ngày trống để vẽ lịch
export function nhomMonTheoNgay(
  cacMon: MonTrongKeHoach[],
  tuNgay: string,
  denNgay: string,
): NgayTrongTuan[] {
  const batDau = new Date(`${tuNgay}T00:00:00`);
  const ketThuc = new Date(`${denNgay}T00:00:00`);
  if (Number.isNaN(batDau.getTime()) || Number.isNaN(ketThuc.getTime()) || batDau > ketThuc) return [];

  const theoNgay = new Map<string, MonTrongKeHoach[]>();
  for (const mon of cacMon) {
    const ds = theoNgay.get(mon.ngay) ?? [];
    ds.push(mon);
    theoNgay.set(mon.ngay, ds);
  }

  const ketQua: NgayTrongTuan[] = [];
  const conTro = new Date(batDau);
  while (conTro <= ketThuc && ketQua.length < SO_NGAY_TOI_DA) {
    const maNgay = sangYyyyMmDd(conTro);
    const monTrongNgay = theoNgay.get(maNgay) ?? [];
    ketQua.push({
      ngay: maNgay,
      cacBuoi: CAC_BUOI_AN.map((buoi) => ({
        ma: buoi.ma,
        nhan: buoi.nhan,
        mon: monTrongNgay.filter((m) => m.loaiBuoiAn === buoi.ma),
      })),
    });
    conTro.setDate(conTro.getDate() + 1);
  }
  return ketQua;
}
