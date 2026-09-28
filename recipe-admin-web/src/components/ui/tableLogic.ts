/**
 * Logic thuan cua DataTable (Task 28).
 *
 * Tach rieng khoi component de (1) test duoc nhanh, khong can render DOM,
 * (2) quy tac BR-01 "STT la so thu tu hien thi, khong phai ID" co mot noi
 * duy nhat de kiem chung thay vi lan rai trong JSX.
 */

/**
 * STT hien thi cua ban ghi tai `index` trong trang `page`.
 *
 * Trang dau tien (page = 0) bat dau tu 1. Sang trang sau phai cong them
 * `page * pageSize`, neu khong moi trang deu hien STT tu 1 lai - loi dang
 * co trong RecipesPage cu (no tinh `i + 1` ma khong cong offset trang).
 *
 * @param index  Vi tri trong `rows` cua trang hien tai (0-based)
 * @param page   So trang (0-based)
 * @param pageSize So ban ghi moi trang
 */
export function calcStt(index: number, page: number, pageSize: number): number {
  if (!Number.isFinite(index) || index < 0) return 0;
  const p = Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
  const s = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 0;
  return Math.floor(index) + 1 + p * s;
}

/** So trang can co de hien het `totalItems` ban ghi. */
export function totalPages(totalItems: number, pageSize: number): number {
  if (!Number.isFinite(totalItems) || totalItems <= 0) return 0;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return 0;
  return Math.ceil(totalItems / pageSize);
}

/**
 * Giu `page` trong khoang hop le.
 *
 * Can cho truong hop xoa/xuat ban ghi lam `totalPages` giam xuong, khi do
 * `page` dang mo co the tro toi trang khong ton tai va bang se rong.
 */
export function clampPage(page: number, tp: number): number {
  if (!Number.isFinite(tp) || tp <= 0) return 0;
  if (!Number.isFinite(page) || page < 0) return 0;
  return Math.min(Math.floor(page), tp - 1);
}

export type SortDirection = 'asc' | 'desc';

export type SortValue = string | number | null | undefined;

/**
 * Sap xep ban ghi ma KHONG mutation mang vao props.
 *
 * Gia tri `null`/`undefined` luon xep o cuoi du chieu sap xep nao, vi "chua co
 * du lieu" khong phai la mot gia tri lon/nho co y nghia.
 */
export function sortRows<T>(
  rows: readonly T[],
  valueOf: (row: T) => SortValue,
  direction: SortDirection,
): T[] {
  const mul = direction === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const va = valueOf(a);
    const vb = valueOf(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') {
      if (va === vb) return 0;
      return (va < vb ? -1 : 1) * mul;
    }
    // localeCompare voi 'vi' de 'a' < 'b' < 'c' (khong phai thu tu byte)
    const cmp = String(va).localeCompare(String(vb), 'vi');
    return cmp === 0 ? 0 : cmp * mul;
  });
}
