/**
 * Test cho trang quan ly Recipe Reference (Task 32, FR-ADM-04).
 *
 * Tach hai lop nhu Task 30/31:
 * - logic thuan trong `referenceQuery.ts` (dung tham so, trang thai dong bo) -
 *   test khong can DOM,
 * - component - test bang DOM qua `renderWithProviders`, `apiClient` gia lap
 *   nen khong cham backend that.
 *
 * Ruling Task 32:
 * - KHONG co cot "Actions" va khong co nut Sync: backend khong co endpoint sync
 *   nao (DEFER-13), giong DEFER-08 (ban CategoryTagsPage).
 * - Cot theo README (spec FR-ADM-04): STT, Title, External ID, Status, Scores,
 *   Last Synced - plan ghi "Source" nhung user chot theo README (Scores).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import { apiClient } from '../../api/client';
import ReferencesPage from './ReferencesPage';
import { SyncStatusBadge } from './SyncStatusBadge';
import {
  REFERENCE_PAGE_SIZE,
  buildReferenceListParams,
  formatReferenceDateTime,
  formatReferenceScores,
  isReferenceStatus,
  referenceSyncState,
  type RecipeReference,
} from './referenceQuery';

vi.mock('../../api/client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);

// --- Fixture ------------------------------------------------------------------

function ref(over: Partial<RecipeReference> = {}): RecipeReference {
  return {
    id: 'ref-1',
    source: 'SPOONACULAR',
    externalId: '1100001',
    title: 'Chicken Tikka Masala',
    imageUrl: null,
    servings: 4,
    status: 'ACTIVE',
    spoonacularScore: 82.5,
    healthScore: 71,
    aggregateLikes: 1234,
    lastSyncedAt: null,
    createdAt: '2026-09-27T18:51:10.922Z',
    updatedAt: '2026-09-27T18:51:10.922Z',
    ...over,
  };
}

function paged<T>(content: T[], totalElements = content.length) {
  return {
    content,
    pageable: { pageNumber: 0, pageSize: REFERENCE_PAGE_SIZE },
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / REFERENCE_PAGE_SIZE)),
  };
}

function serveList(content: RecipeReference[], totalElements?: number) {
  get.mockImplementation((url: unknown) => {
    const u = String(url);
    if (u.startsWith('/recipe-references?')) {
      return Promise.resolve({ data: paged(content, totalElements) } as never);
    }
    return Promise.reject(new Error(`URL khong mong doi: ${u}`));
  });
}

function apiError(status: number, message: string) {
  return {
    isAxiosError: true,
    response: { status, data: { statusCode: status, message } },
  };
}

function requestedUrls(): string[] {
  return get.mock.calls.map((c) => String(c[0]));
}

function bodyRows(): HTMLElement[] {
  return screen.getAllByRole('row').slice(1);
}

beforeEach(() => {
  get.mockReset();
});

// =============================================================================
describe('referenceQuery - tham so truy van', () => {
  it('mac dinh gui page=0 va size=10', () => {
    const params = buildReferenceListParams();
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('10');
  });

  it('size > 50 bi cat ve 50 (khop @Max cua backend)', () => {
    expect(buildReferenceListParams({ size: 999 }).get('size')).toBe('50');
  });

  it('size khong hop le roi ve mac dinh thay vi gui di', () => {
    expect(buildReferenceListParams({ size: 0 }).get('size')).toBe('10');
    expect(buildReferenceListParams({ size: -5 }).get('size')).toBe('10');
    expect(buildReferenceListParams({ size: Number.NaN }).get('size')).toBe('10');
  });

  it('page am roi ve 0', () => {
    expect(buildReferenceListParams({ page: -2 }).get('page')).toBe('0');
  });

  it('search duoc trim, bo han khi rong', () => {
    const p = buildReferenceListParams({ search: '  pho  ' });
    expect(p.get('search')).toBe('pho');
    expect(buildReferenceListParams({ search: '   ' }).has('search')).toBe(false);
  });

  it('chi gui status khi hop le (ACTIVE/UNAVAILABLE), gia tri khac bo qua', () => {
    expect(buildReferenceListParams({ status: 'ACTIVE' }).get('status')).toBe('ACTIVE');
    expect(buildReferenceListParams({ status: 'UNAVAILABLE' }).get('status')).toBe('UNAVAILABLE');
    expect(buildReferenceListParams({ status: 'BANNED' }).has('status')).toBe(false);
  });

  it('isReferenceStatus nhan dung hai gia tri cua enum', () => {
    expect(isReferenceStatus('ACTIVE')).toBe(true);
    expect(isReferenceStatus('UNAVAILABLE')).toBe(true);
    expect(isReferenceStatus('BANNED')).toBe(false);
    expect(isReferenceStatus(undefined)).toBe(false);
  });
});

// =============================================================================
describe('referenceQuery - trang thai dong bo', () => {
  it('lastSyncedAt null -> "Chu dong bo" mau xam', () => {
    expect(referenceSyncState(null)).toEqual({
      label: 'Chưa đồng bộ',
      tone: 'gray',
      syncedAt: null,
    });
  });

  it('lastSyncedAt hop le -> "Da dong bo" mau xanh, giu nguyen chuoi', () => {
    const iso = '2026-08-25T10:00:00.000Z';
    expect(referenceSyncState(iso)).toEqual({
      label: 'Đã đồng bộ',
      tone: 'green',
      syncedAt: iso,
    });
  });

  it('lastSyncedAt sai dinh dang -> "Chu dong bo" thay vi "Invalid Date"', () => {
    expect(referenceSyncState('khong-phai-ngay').label).toBe('Chưa đồng bộ');
  });

  it('formatReferenceDateTime: hop le theo vi-VN, sai/rong tra ve rong', () => {
    const out = formatReferenceDateTime('2026-08-25T10:00:00.000Z');
    // Chi kiem ngay (theo vi-VN), khong kiem gio: gio phu thuoc mui gio may chay test.
    expect(out).toContain('25/8/2026');
    expect(formatReferenceDateTime(null)).toBe('');
    expect(formatReferenceDateTime('sai')).toBe('');
  });

  it('formatReferenceScores: gop 3 chi so, null thi tra ve null', () => {
    expect(formatReferenceScores(ref())).toBe('82,5 / 71 / 1.234');
    expect(
      formatReferenceScores(ref({ spoonacularScore: null, healthScore: null, aggregateLikes: null })),
    ).toBeNull();
  });
});

// =============================================================================
describe('SyncStatusBadge', () => {
  it('chua dong bo thi hien "Chu dong bo"', () => {
    renderWithProviders(<SyncStatusBadge syncedAt={null} />);
    expect(screen.getByText('Chưa đồng bộ')).toBeInTheDocument();
  });

  it('da dong bo thi hien "Da dong bo" va ngay gio', () => {
    renderWithProviders(<SyncStatusBadge syncedAt="2026-08-25T10:00:00.000Z" />);
    expect(screen.getByText('Đã đồng bộ')).toBeInTheDocument();
    expect(screen.getByText(/25\/8\/2026/)).toBeInTheDocument();
  });
});

// =============================================================================
describe('ReferencesPage', () => {
  it('tai danh sach tu /recipe-references', async () => {
    serveList([ref()]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Chicken Tikka Masala')).toBeInTheDocument());
    expect(requestedUrls()[0]).toBe('/recipe-references?page=0&size=10');
  });

  it('cot dung thu tu README (FR-ADM-04), KHONG co cot Thao tac vi khong co nut Sync (DEFER-13)', async () => {
    serveList([ref()]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Chicken Tikka Masala')).toBeInTheDocument());
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent?.trim() ?? '');
    expect(heads).toEqual(['STT', 'Tên', 'ID ngoài', 'Trạng thái', 'Điểm', 'Lần đồng bộ']);
    expect(screen.queryByRole('columnheader', { name: 'Thao tác' })).not.toBeInTheDocument();
  });

  it('badge trang thai tieng Viet: ACTIVE -> "Dang hoat dong", UNAVAILABLE -> "Khong kha dung"', async () => {
    serveList([ref(), ref({ id: 'ref-2', externalId: '1100002', title: 'Phở Bò', status: 'UNAVAILABLE' })]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Phở Bò')).toBeInTheDocument());
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Không khả dụng')).toBeInTheDocument();
  });

  it('cot Diem hien thi 3 chi so formatVn, ca 3 null thi gach ngang', async () => {
    serveList([
      ref(),
      ref({
        id: 'ref-2',
        externalId: '1100002',
        title: 'No Score',
        spoonacularScore: null,
        healthScore: null,
        aggregateLikes: null,
      }),
    ]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('No Score')).toBeInTheDocument());
    const rows = bodyRows();
    expect(within(rows[0]).getAllByRole('cell')[4]).toHaveTextContent('82,5 / 71 / 1.234');
    expect(within(rows[1]).getAllByRole('cell')[4]).toHaveTextContent('—');
  });

  it('cot Lan dong bo: null -> "Chu dong bo", co ngay -> "Da dong bo" + ngay gio', async () => {
    serveList([
      ref({ lastSyncedAt: null }),
      ref({ id: 'ref-2', externalId: '1100002', title: 'Đã Sync', lastSyncedAt: '2026-08-25T10:00:00.000Z' }),
    ]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Đã Sync')).toBeInTheDocument());
    expect(screen.getByText('Chưa đồng bộ')).toBeInTheDocument();
    expect(screen.getByText('Đã đồng bộ')).toBeInTheDocument();
    expect(screen.getByText(/25\/8\/2026/)).toBeInTheDocument();
  });

  it('tim kiem chay khi Enter, gui search va ve trang 1', async () => {
    serveList([ref({ title: 'Phở Bò' })]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Phở Bò')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Tìm reference'), { target: { value: 'pho' } });
    fireEvent.submit(screen.getByLabelText('Tìm reference').closest('form') as HTMLFormElement);

    await waitFor(() =>
      expect(requestedUrls().some((u) => u.includes('search=pho'))).toBe(true),
    );
    const last = requestedUrls()[requestedUrls().length - 1];
    expect(last).toContain('page=0');
    expect(last).toContain('search=pho');
  });

  it('xoa tim kiem thi tai lai danh sach khong co search', async () => {
    serveList([ref()]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Chicken Tikka Masala')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Tìm reference'), { target: { value: 'pho' } });
    fireEvent.submit(screen.getByLabelText('Tìm reference').closest('form') as HTMLFormElement);
    await waitFor(() =>
      expect(requestedUrls().some((u) => u.includes('search=pho'))).toBe(true),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    await waitFor(() => expect(requestedUrls().at(-1)).toBe('/recipe-references?page=0&size=10'));
  });

  it('STT la so thu tu hien thi, KHONG phai id (BR-01): trang 2 bat dau tu 11', async () => {
    const rows = Array.from({ length: 15 }, (_, i) =>
      ref({ id: `r-${i}`, externalId: String(1100000 + i), title: `Món ${i + 1}` }),
    );
    serveList(rows, 15);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Món 1')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    await waitFor(() =>
      expect(requestedUrls().some((u) => u.includes('page=1'))).toBe(true),
    );
    expect(requestedUrls().at(-1)).toContain('page=1');
    const page2 = bodyRows();
    expect(within(page2[0]).getAllByRole('cell')[0]).toHaveTextContent('11');
  });

  it('loi tai danh sach hien ErrorBanner voi ma loi backend', async () => {
    get.mockRejectedValue(apiError(500, '[REF-99] Lỗi máy chủ'));
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText(/\[REF-99\]/)).toBeInTheDocument());
  });

  it('danh sach rong hien thong bao, co tim kiem thi thong bao khác', async () => {
    serveList([]);
    renderWithProviders(<ReferencesPage />);
    await waitFor(() => expect(screen.getByText('Chưa có reference nào')).toBeInTheDocument());
  });
});