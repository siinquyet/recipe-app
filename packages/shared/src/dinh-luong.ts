// BR-03: Mốc định lượng + đơn vị dùng chung web/mobile
export const MOC_DINH_LUONG = [
  { nhan: '0,1 – 1', min: 0.1, max: 1, buoc: 0.1 },
  { nhan: '1 – 10', min: 1, max: 10, buoc: 0.5 },
  { nhan: '10 – 100', min: 10, max: 100, buoc: 1 },
  { nhan: '100 – 1.000', min: 100, max: 1000, buoc: 5 },
] as const;

export const DON_VI_CHUAN = [
  'g',
  'kg',
  'ml',
  'lít',
  'muỗng canh',
  'muỗng cà phê',
  'quả',
  'củ',
  'gói',
  'nhúm',
] as const;

export function mocChoGiaTri(giaTri: number): number {
  // BR-03: Biên nửa mở [min, max) để giá trị biên (1, 10, 100) rơi đúng mốc trên
  let chon = 0;
  MOC_DINH_LUONG.forEach((m, i) => {
    if (giaTri >= m.min) chon = i;
  });
  return chon;
}
