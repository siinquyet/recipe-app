import { layUrlAnh } from '../anh';

describe('layUrlAnh', () => {
  it('giu nguyen URL tuyet doi', () => {
    expect(layUrlAnh('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });

  it('doi duong dan tuong doi thanh tuyet doi theo backend', () => {
    const ketQua = layUrlAnh('/uploads/abc.jpg');
    expect(ketQua).toContain('/uploads/abc.jpg');
    expect(ketQua.startsWith('http')).toBe(true);
  });

  it('tra chuoi rong khi thieu', () => {
    expect(layUrlAnh(null)).toBe('');
    expect(layUrlAnh('')).toBe('');
  });
});
