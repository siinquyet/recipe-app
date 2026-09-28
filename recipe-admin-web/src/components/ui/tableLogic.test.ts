/**
 * Test cho logic thuan cua DataTable (Task 28 - BR-01 "STT khong phai ID").
 *
 * Tach rieng khoi component de test duoc nhanh va khong can render DOM.
 */
import { describe, it, expect } from 'vitest';
import { calcStt, totalPages, clampPage, sortRows } from './tableLogic';

describe('calcStt', () => {
  it('trang 1 bat dau tu 1', () => {
    expect(calcStt(0, 0, 10)).toBe(1);
    expect(calcStt(9, 0, 10)).toBe(10);
  });

  it('cong them offset cua trang truoc do khi sang trang sau', () => {
    // Trang 2 (page=1) voi pageSize=10: bat dau tu 11, khong phai tu 1
    expect(calcStt(0, 1, 10)).toBe(11);
    expect(calcStt(4, 1, 10)).toBe(15);
    expect(calcStt(0, 2, 10)).toBe(21);
  });

  it('giai quyet pageSize khac nhau', () => {
    expect(calcStt(0, 3, 25)).toBe(76);
    expect(calcStt(2, 1, 5)).toBe(8);
  });

  it('tra ve 0 khi input khong hop le thay vi NaN', () => {
    expect(calcStt(-1, 0, 10)).toBe(0);
    expect(calcStt(0, -5, 10)).toBe(1); // page am -> coi nhu 0, khong tru offset
    expect(calcStt(0, 0, 0)).toBe(1); // pageSize 0 -> offset 0
    expect(calcStt(Number.NaN, 0, 10)).toBe(0);
  });
});

describe('totalPages', () => {
  it('tinh dung khi chia het va chia le', () => {
    expect(totalPages(100, 10)).toBe(10);
    expect(totalPages(101, 10)).toBe(11);
    expect(totalPages(1, 10)).toBe(1);
  });

  it('tra 0 khong co du lieu hoac pageSize khong hop le', () => {
    expect(totalPages(0, 10)).toBe(0);
    expect(totalPages(10, 0)).toBe(0);
    expect(totalPages(-5, 10)).toBe(0);
  });
});

describe('clampPage', () => {
  it('giua page trong khoang hop le', () => {
    expect(clampPage(0, 5)).toBe(0);
    expect(clampPage(3, 5)).toBe(3);
    expect(clampPage(4, 5)).toBe(4);
  });

  it('keo ve cuoi neu vuot qua trang cuoi', () => {
    // Sau khi xoa het ban ghi, totalPages giam, page dang o 3 se bi keo ve 0
    expect(clampPage(9, 5)).toBe(4);
    expect(clampPage(99, 2)).toBe(1);
  });

  it('keo ve 0 neu page am hoac khong co trang nao', () => {
    expect(clampPage(-1, 5)).toBe(0);
    expect(clampPage(0, 0)).toBe(0);
    expect(clampPage(3, 0)).toBe(0);
  });
});

describe('sortRows', () => {
  const rows = [
    { ten: 'Bánh mì', luong: 30 },
    { ten: 'Áp chào', luong: 10 },
    { ten: 'Chè', luong: 20 },
  ];

  it('so sanh so theo thu tu tang dan', () => {
    const out = sortRows(rows, (r) => r.luong, 'asc');
    expect(out.map((r) => r.luong)).toEqual([10, 20, 30]);
  });

  it('so sanh so theo thu tu giam dan', () => {
    const out = sortRows(rows, (r) => r.luong, 'desc');
    expect(out.map((r) => r.luong)).toEqual([30, 20, 10]);
  });

  it('so sanh chuoi theo kieu tieng Viet co dau', () => {
    const out = sortRows(rows, (r) => r.ten, 'asc');
    // 'a' < 'b' < 'c' nen 'Áp chào' phai dau tien
    expect(out.map((r) => r.ten)).toEqual(['Áp chào', 'Bánh mì', 'Chè']);
  });

  it('dat gia tri null/undefined xuong cuoi du chieu nao', () => {
    const withNull = [
      { ten: 'Có dữ liệu', luong: 5 },
      { ten: 'Chưa có dữ liệu', luong: null },
    ];
    expect(sortRows(withNull, (r) => r.luong, 'asc').at(-1)?.ten).toBe('Chưa có dữ liệu');
    expect(sortRows(withNull, (r) => r.luong, 'desc').at(-1)?.ten).toBe('Chưa có dữ liệu');
  });

  it('khong mutation mang vao props', () => {
    const original = [...rows];
    sortRows(rows, (r) => r.luong, 'desc');
    expect(rows).toEqual(original);
  });
});
