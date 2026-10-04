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

// BR-UI: Thứ tiếng Việt cho lịch tuần (Date chỉ cho số thứ)
const TEN_THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

export function tenThuTiengViet(ngayYyyyMmDd: string): string {
  const d = new Date(`${ngayYyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return TEN_THU[d.getDay()];
}

// BR-MEAL: Nhãn thứ ngắn cho dải chọn ngày (CN, T2...T7)
export function nhanThuNgan(ngayYyyyMmDd: string): string {
  const d = new Date(`${ngayYyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  const thu = d.getDay();
  return thu === 0 ? 'CN' : `T${thu + 1}`;
}

// BR-MEAL: Cộng n ngày vào YYYY-MM-DD, giữ định dạng
export function congNgay(ngayYyyyMmDd: string, soNgay: number): string {
  const d = new Date(`${ngayYyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ngayYyyyMmDd;
  d.setDate(d.getDate() + soNgay);
  return sangYyyyMmDd(d);
}

// BR-MEAL: Hôm nay theo YYYY-MM-DD (múi giờ máy)
export function homNay(): string {
  return sangYyyyMmDd(new Date());
}

// BR-MEAL: Thứ Hai và Chủ nhật tuần này để preset khoảng khỏi gõ ngày
export function dauTuanNay(): string {
  const d = new Date();
  const thu = d.getDay();
  const lui = thu === 0 ? 6 : thu - 1;
  d.setDate(d.getDate() - lui);
  return sangYyyyMmDd(d);
}

export function cuoiTuanNay(): string {
  return congNgay(dauTuanNay(), 6);
}

// BR-MEAL: Gợi ý buổi theo giờ hiện tại để khỏi chọn tay
export function buoiGoiYTheoGio(gio = new Date().getHours()): string {
  if (gio < 10) return 'BREAKFAST';
  if (gio < 15) return 'LUNCH';
  if (gio < 21) return 'DINNER';
  return 'BREAKFAST';
}

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
