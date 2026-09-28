/**
 * Test StatusBadge (Task 28).
 *
 * Quan trong: nhan tieng Viet cho tung trang thai trong Prisma schema
 * (recipe-backend-api/prisma/schema.prisma) va fallback an toan khi gap
 * trang thai la.
 */
import { describe, it, expect } from 'vitest';
import { STATUS_META, resolveStatus } from './statusMeta';

describe('resolveStatus', () => {
  it('lay dung nhan tieng Viet cho RecipeStatus', () => {
    expect(resolveStatus('DRAFT').label).toBe('Nháp');
    expect(resolveStatus('PENDING').label).toBe('Chờ duyệt');
    expect(resolveStatus('APPROVED').label).toBe('Đã duyệt');
    expect(resolveStatus('REJECTED').label).toBe('Từ chối');
    expect(resolveStatus('HIDDEN').label).toBe('Đã ẩn');
  });

  it('lay dung nhan cho ReferenceStatus', () => {
    expect(resolveStatus('ACTIVE').label).toBe('Đang hoạt động');
    expect(resolveStatus('UNAVAILABLE').label).toBe('Không khả dụng');
  });

  it('lay dung nhan cho trang thai nguoi dung (User.status)', () => {
    expect(resolveStatus('BANNED').label).toBe('Đã khóa');
  });

  it('lay dung nhan cho ReportStatus', () => {
    expect(resolveStatus('RESOLVED').label).toBe('Đã xử lý');
  });

  it('lay dung nhan cho ShoppingListStatus', () => {
    expect(resolveStatus('COMPLETED').label).toBe('Đã hoàn thành');
    expect(resolveStatus('ARCHIVED').label).toBe('Đã lưu trữ');
  });

  it('lay dung nhan cho IngredientMappingStatus', () => {
    expect(resolveStatus('MAPPED').label).toBe('Đã ánh xạ');
    expect(resolveStatus('UNMAPPED').label).toBe('Chưa ánh xạ');
  });

  it('trang thai la khong duoc "do mo" ma van hien thi nguyen ban', () => {
    // Khong duoc nem loi: du lieu lai tu DB, luc do la enum chua duoc cap nhat
    // thi can nhin thay con so voi crash ca trang.
    const r = resolveStatus('SOMETHING_NEW');
    expect(r.label).toBe('SOMETHING_NEW');
    expect(r.tone).toBe('gray');
  });

  it('khong phan biet hoa/thuong: "approved" van ra "Đã duyệt"', () => {
    expect(resolveStatus('approved').label).toBe('Đã duyệt');
    expect(resolveStatus('pending').label).toBe('Chờ duyệt');
  });

  it('chuoi rong khong duoc lam hong component', () => {
    const r = resolveStatus('');
    expect(r.label).toBe('');
    expect(r.tone).toBe('gray');
  });
});

describe('STATUS_META', () => {
  it('phu tat ca cac enum trang thai trong Prisma schema', () => {
    // Danh sach lay tu schema.prisma. Neu backend them enum moi, test nay
    // fail va nho bo sung nhan - dung de im lang hien thi "XXX".
    const expected = [
      'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN',      // RecipeStatus
      'ACTIVE', 'UNAVAILABLE',                                      // ReferenceStatus
      'BANNED',                                                     // User.status
      'RESOLVED',                                                   // ReportStatus
      'COMPLETED', 'ARCHIVED',                                      // ShoppingListStatus
      'MAPPED', 'UNMAPPED',                                         // IngredientMappingStatus
    ];
    for (const s of expected) {
      expect(STATUS_META[s], `thieu nhan cho ${s}`).toBeDefined();
    }
  });

  it('moi trang thai deu co nhan khong rong', () => {
    for (const [key, meta] of Object.entries(STATUS_META)) {
      expect(meta.label, `${key} co nhan rong`).not.toBe('');
      expect(meta.label, `${key} chua duoc Viet hoa - dang hien thi tho "${meta.label}"`)
        .toMatch(/[AÀ-ỹ]/u);
    }
  });
});
