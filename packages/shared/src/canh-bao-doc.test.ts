import { describe, expect, it } from 'vitest';
import { kiemTraComboDoc } from './canh-bao-doc';

describe('kiemTraComboDoc (BR-ANTOAN)', () => {
  it('bắt cặp mật ong + bột sắn ở mức cao', () => {
    const kq = kiemTraComboDoc(['mật ong', 'bột sắn sống']);
    expect(kq.length).toBeGreaterThan(0);
    expect(kq[0].muc).toBe('cao');
  });

  it('món lành không báo', () => {
    expect(kiemTraComboDoc(['thịt bò', 'hành tây'])).toEqual([]);
  });

  it('không phân biệt hoa thường và dấu', () => {
    const kq = kiemTraComboDoc(['MẬT ONG', 'Bot San']);
    expect(kq.length).toBeGreaterThan(0);
  });
});
