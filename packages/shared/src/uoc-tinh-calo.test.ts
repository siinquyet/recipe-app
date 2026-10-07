import { describe, expect, it } from 'vitest';
import { uocTinhCalo } from './uoc-tinh-calo';

describe('uocTinhCalo (BR-DINHDUONG)', () => {
  it('500g thịt gà ra khoảng 700-800 kcal', () => {
    const kcal = uocTinhCalo([{ ten: 'thịt gà', dinhLuong: 500, donVi: 'g' }]);
    expect(kcal).toBeGreaterThan(700);
    expect(kcal).toBeLessThan(800);
  });

  it('đơn vị có dấu vẫn tính được (3 củ sả ~ 60 kcal)', () => {
    expect(uocTinhCalo([{ ten: 'sả', dinhLuong: 3, donVi: 'củ' }])).toBe(60);
  });

  it('đơn vị không tra được thì bỏ qua, không crash', () => {
    expect(uocTinhCalo([{ ten: 'nguyên liệu lạ xyz', dinhLuong: 100, donVi: 'g' }])).toBe(0);
    expect(uocTinhCalo([])).toBe(0);
  });
});
