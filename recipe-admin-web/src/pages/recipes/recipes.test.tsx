/**
 * Test cho trang duyet bai (Task 30).
 *
 * Tach hai lop:
 * - logic thuan trong `recipeQuery.ts` (dung tham so, quy tac BR-02, kiem tra
 *   ly do) - test khong can DOM, va la noi duy nuat quy tac BR-02 co mot noi
 *   duy nhat de so,
 * - component - test bang DOM thong qua `renderWithProviders`, voi `apiClient`
 *   gia lap nen khong cham backend that.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import { apiClient } from '../../api/client';
import AllRecipesPage from './AllRecipesPage';
import PendingRecipesPage from './PendingRecipesPage';
import { RecipeActionButtons } from './RecipeActionButtons';
import {
  RECIPE_TAB_ORDER,
  allowedActions,
  buildRecipeListParams,
  formatDateVi,
  isRecipeSortField,
  isRecipeStatus,
  sanitizeStatus,
  tabLabel,
  validateRejectReason,
  type RecipeDetail,
  type RecipeSummary,
} from './recipeQuery';

vi.mock('../../api/client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const patch = vi.mocked(apiClient.patch);

// --- Fixture ------------------------------------------------------------------

function summary(over: Partial<RecipeSummary> = {}): RecipeSummary {
  return {
    id: 'r-1',
    title: 'Phở bò',
    description: 'Nước phở truyền thống',
    thumbnailUrl: null,
    cookTimeMinutes: 120,
    prepTimeMinutes: 30,
    servings: 4,
    status: 'PENDING',
    source: 'LOCAL',
    rejectionReason: null,
    createdAt: '2026-09-01T03:00:00.000Z',
    updatedAt: '2026-09-01T03:00:00.000Z',
    author: { displayName: 'Nguyễn Văn A', email: 'a@cookbook.vn' },
    ...over,
  };
}

function detail(over: Partial<RecipeDetail> = {}): RecipeDetail {
  return {
    ...summary(),
    authorId: 'u-1',
    externalId: null,
    categoryId: null,
    deletedAt: null,
    category: null,
    tags: [],
    ingredients: [
      { id: 'i-2', originalText: 'Bò', quantity: '500', unit: 'g', sortOrder: 2 },
      { id: 'i-1', originalText: 'Xương', quantity: '1', unit: 'kg', sortOrder: 1 },
    ],
    steps: [
      { id: 's-2', stepOrder: 2, content: 'Nêm nếm', imageUrl: null },
      { id: 's-1', stepOrder: 1, content: 'Rửa xương', imageUrl: null },
    ],
    nutrition: { calories: 650, protein: 32, carbs: 70, fat: 18 },
    ...over,
  };
}

function paged<T>(content: T[], totalElements = content.length) {
  return {
    content,
    pageable: { pageNumber: 0, pageSize: 10 },
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / 10)),
  };
}

/** Tra du lieu danh sach theo tung URL, de test khong phai quan tam thu tu goi. */
function serveList(content: RecipeSummary[], totalElements?: number) {
  get.mockImplementation((url: unknown) => {
    const u = String(url);
    if (u.startsWith('/recipes?')) {
      return Promise.resolve({ data: paged(content, totalElements) } as never);
    }
    if (u.startsWith('/recipes/')) {
      // Chi tiet phai phai ban gia tu `id` trong danh sach, neu khong test
      // "xem mon da tu choi" se khong thay ly do do.
      const id = u.slice('/recipes/'.length);
      const row = content.find((c) => c.id === id) ?? content[0];
      return Promise.resolve({ data: detail(row ?? {}) } as never);
    }
    return Promise.reject(new Error(`URL khong mong doi: ${u}`));
  });
}

function requestedUrls(): string[] {
  return get.mock.calls.map((c) => String(c[0]));
}

/**
 * Cac dong du lieu cua bang (bo dong tieu de).
 *
 * Phai khoanh vung theo dong truoc khi kiem tra nut cua dong: ten nut thao tac
 * trung dung voi ten muc loc ("Tu choi") va voi badge trong dong ("Da an"), nen
 * `screen.getByRole` se tim thay 2 phan tu va bao loi nhieu phan tu - loi cua
 * test chu khong phai loi cua trang.
 */
function bodyRows(): HTMLElement[] {
  return screen.getAllByRole('row').slice(1);
}

beforeEach(() => {
  vi.clearAllMocks();
  serveList([]);
});

// --- Logic thuan --------------------------------------------------------------

describe('recipeQuery - quy tac BR-02', () => {
  it('chi PENDING moi duyet/tu choi duoc', () => {
    expect(allowedActions('PENDING')).toEqual(['approve', 'reject']);
  });

  it('chi APPROVED va REJECTED moi an duoc', () => {
    expect(allowedActions('APPROVED')).toEqual(['hide']);
    expect(allowedActions('REJECTED')).toEqual(['hide']);
  });

  it('DRAFT va HIDDEN khong co thao tac duyet nao', () => {
    // `HIDDEN` rong la do backend CHUA CO endpoint `unhide` - xem DEFER-06.
    expect(allowedActions('DRAFT')).toEqual([]);
    expect(allowedActions('HIDDEN')).toEqual([]);
  });

  it('khong doan trang thai la: rong / null / rac deu khong cho phep gi', () => {
    expect(allowedActions(null)).toEqual([]);
    expect(allowedActions(undefined)).toEqual([]);
    expect(allowedActions('')).toEqual([]);
    expect(allowedActions('KHONG_CO_THAT')).toEqual([]);
  });

  it('khong phan biet hoa thuong trang thai', () => {
    expect(allowedActions('pending')).toEqual(['approve', 'reject']);
  });
});

describe('recipeQuery - kiem tra ly do tu choi', () => {
  it('bat buoc co ly do (BR-02)', () => {
    expect(validateRejectReason('')).toMatch(/bắt buộc/);
    expect(validateRejectReason('   ')).toMatch(/bắt buộc/);
  });

  it('giu nguyen gioi han cua backend: 5..500 ky tu', () => {
    // Kiem tra bang chinh thuc ta cua `ModeratorActionDto`, khong phai so tu do.
    expect(validateRejectReason('abcd')).toMatch(/tối thiểu 5/);
    expect(validateRejectReason('abcde')).toBeNull();
    expect(validateRejectReason('x'.repeat(500))).toBeNull();
    expect(validateRejectReason('x'.repeat(501))).toMatch(/tối đa 500/);
  });

  it('dem ky tu sau khi cat khoang trang, dung nhu backend nhan gia tri da cat', () => {
    expect(validateRejectReason('  abcd  ')).toMatch(/tối thiểu 5/);
  });
});

describe('recipeQuery - tham so truy van', () => {
  it('mac dinh: trang 0, 10 dong, khong sort', () => {
    const p = buildRecipeListParams();
    expect(p.get('page')).toBe('0');
    expect(p.get('size')).toBe('10');
    expect(p.has('sortBy')).toBe(false);
  });

  it('cat trang am va gioi han size 1..50 cua backend', () => {
    expect(buildRecipeListParams({ page: -5 }).get('page')).toBe('0');
    expect(buildRecipeListParams({ size: 999 }).get('size')).toBe('50');
    expect(buildRecipeListParams({ size: 0 }).get('size')).toBe('10');
    // Gui size=0 se bi `@Min(1)` cua RecipeQueryDto tra 400.
  });

  it('bo qua trang thai khong hop le thay vi gui len de backend tra [REC-05]', () => {
    expect(buildRecipeListParams({ status: 'PENDING' }).get('status')).toBe('PENDING');
    expect(buildRecipeListParams({ status: 'PENDING_X' }).has('status')).toBe(false);
    expect(sanitizeStatus('approved')).toBe('APPROVED');
    expect(sanitizeStatus('rac')).toBe('');
  });

  it('cat khoang trang va bo qua search rong', () => {
    expect(buildRecipeListParams({ search: '  pho  ' }).get('search')).toBe('pho');
    expect(buildRecipeListParams({ search: '   ' }).has('search')).toBe(false);
  });

  it('chi gui sort khi nguoi dung chon, kem huong mac dinh la desc', () => {
    const p = buildRecipeListParams({ sortBy: 'title' });
    expect(p.get('sortBy')).toBe('title');
    expect(p.get('sortDirection')).toBe('desc');
    expect(buildRecipeListParams({ sortBy: 'title', sortDirection: 'asc' }).get('sortDirection')).toBe('asc');
    // `sortBy` rac se bi backend tra [REC-05] nen phai bo qua.
    expect(buildRecipeListParams({ sortBy: 'sdf' as never }).has('sortBy')).toBe(false);
  });

  it('ma hoa tham so search co ky tu dac biet', () => {
    expect(buildRecipeListParams({ search: 'a&b=c' }).toString()).toContain('search=a%26b%3Dc');
  });
});

describe('recipeQuery - nhan hien thi', () => {
  it('lay nhan tu statusMeta de khong ton tai hai noi doi ten', () => {
    expect(tabLabel('PENDING')).toBe('Chờ duyệt');
    expect(tabLabel('APPROVED')).toBe('Đã duyệt');
  });

  it('"Tat ca" khong phai mot trang thai nen khong nam trong statusMeta', () => {
    expect(tabLabel('')).toBe('Tất cả');
  });

  it('muc loc phu het trang thai cua schema', () => {
    expect(RECIPE_TAB_ORDER).toEqual(['', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DRAFT']);
  });

  it('ngay sai dinh dang ra chuoi rong chu khong phai "Invalid Date"', () => {
    expect(formatDateVi(null)).toBe('');
    expect(formatDateVi('khong-phai-ngay')).toBe('');
    expect(formatDateVi('2026-09-01T03:00:00.000Z')).not.toBe('');
  });

  it('bam loc trang thai / truong sap xep dung tap gia tri backend', () => {
    expect(isRecipeStatus('PENDING')).toBe(true);
    expect(isRecipeStatus('rac')).toBe(false);
    expect(isRecipeSortField('createdAt')).toBe(true);
    expect(isRecipeSortField('status')).toBe(false);
  });
});

// --- RecipeActionButtons ------------------------------------------------------

describe('RecipeActionButtons', () => {
  const noop = () => {};

  it('PENDING: co Xem, Duyet, Tu choi; khong co An', () => {
    renderWithProviders(
      <RecipeActionButtons
        recipe={{ id: 'r-1', title: 'Phở bò', status: 'PENDING' }}
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ẩn' })).not.toBeInTheDocument();
  });

  it('APPROVED: chi co Xem va An - khong hien nut Duyet chac chan se 409', () => {
    renderWithProviders(
      <RecipeActionButtons
        recipe={{ id: 'r-1', title: 'Phở bò', status: 'APPROVED' }}
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Ẩn' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Duyệt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Từ chối' })).not.toBeInTheDocument();
  });

  it('DRAFT: chi con nut Xem va dau gach ngang, khong de o rong', () => {
    renderWithProviders(
      <RecipeActionButtons
        recipe={{ id: 'r-1', title: 'Phở bò', status: 'DRAFT' }}
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
      />,
    );
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('an nut Xem khi dang o trong hop thoai chi tiet', () => {
    renderWithProviders(
      <RecipeActionButtons
        recipe={{ id: 'r-1', title: 'Phở bò', status: 'PENDING' }}
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
        showView={false}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Xem' })).not.toBeInTheDocument();
  });

  it('vo hieu hoa moi nut khi mot thao tac dang chay', () => {
    renderWithProviders(
      <RecipeActionButtons
        recipe={{ id: 'r-1', title: 'Phở bò', status: 'PENDING' }}
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
        busyKind="approve"
      />,
    );
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeDisabled();
    // "Xem" chi xem, khong doi du lieu nen van dung.
    expect(screen.getByRole('button', { name: 'Xem' })).toBeEnabled();
  });
});

// --- PendingRecipesPage -------------------------------------------------------

describe('PendingRecipesPage', () => {
  it('goi API lay dung trang thai PENDING va hien so bai cho duyet', async () => {
    serveList([summary(), summary({ id: 'r-2', title: 'Bún chả' })], 2);
    renderWithProviders(<PendingRecipesPage />);

    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());
    expect(requestedUrls()[0]).toContain('status=PENDING');
    expect(screen.getByText('Bún chả')).toBeInTheDocument();
    expect(screen.getByText('2 chờ duyệt')).toBeInTheDocument();
  });

  it('cot STT bat dau tu 1 va tang dan theo thu tu hien thi (BR-01)', async () => {
    serveList([summary(), summary({ id: 'r-2', title: 'Bún chả' })]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    // O cot dau tien cua tung dong - khong kiem tra bang regex tren toan trang
    // vi "1" / "2" xuat hien o nhieu cho khac.
    const rows = bodyRows();
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveTextContent('1');
    expect(within(rows[1]).getAllByRole('cell')[0]).toHaveTextContent('2');
  });

  it('duyet: mo hop xac nhan, xac nhan moi goi PATCH approve', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Duyệt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Duyệt công thức' });
    expect(patch).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt' }));
    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/admin/recipes/r-1/approve'),
    );
  });

  it('duyet: huy thi khong goi API', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Duyệt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Duyệt công thức' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Hủy' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Duyệt công thức' })).not.toBeInTheDocument(),
    );
    expect(patch).not.toHaveBeenCalled();
  });

  it('tu choi: chua nhap ly do thi chan lai, khong goi API', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
    const dialog = await screen.findByRole('dialog', { name: 'Từ chối công thức' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận từ chối' }));

    expect(await within(dialog).findByText(/bắt buộc/)).toBeInTheDocument();
    expect(patch).not.toHaveBeenCalled();
  });

  it('tu choi: ly do qua ngan thuoi thi goi PATCH reject kem body', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
    const dialog = await screen.findByRole('dialog', { name: 'Từ chối công thức' });
    fireEvent.change(within(dialog).getByLabelText(/Lý do từ chối/), {
      target: { value: 'Thiếu hình ảnh' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận từ chối' }));

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith('/admin/recipes/r-1/reject', {
        reason: 'Thiếu hình ảnh',
      }),
    );
  });

  it('tu choi: loi tu backend duoc hien nguyen van, giu lai ly do da go', async () => {
    serveList([summary()]);
    patch.mockRejectedValue({
      response: { data: { message: '[ADM-05] Chỉ duyệt được công thức ở trạng thái PENDING' } },
    });
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
    const dialog = await screen.findByRole('dialog', { name: 'Từ chối công thức' });
    const input = within(dialog).getByLabelText(/Lý do từ chối/);
    fireEvent.change(input, { target: { value: 'Thiếu hình ảnh' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận từ chối' }));

    expect(await within(dialog).findByText(/ADM-05/)).toBeInTheDocument();
    // Ly do phai con nguyen de sua roi gui lai, khong phai nhap lai tu dau.
    expect(input).toHaveValue('Thiếu hình ảnh');
  });

  it('loi cua thao tac xuat hien tren dau trang, khong o trong hop thoai', async () => {
    serveList([summary()]);
    patch.mockRejectedValue({ response: { data: { message: '[ADM-06] Chỉ ẩn công thức APPROVED' } } });
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Duyệt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Duyệt công thức' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Duyệt' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('[ADM-06]');
    expect(screen.queryByRole('dialog', { name: 'Duyệt công thức' })).not.toBeInTheDocument();
  });

  it('khong co bai nao thi hien thong bao rong, khong phai bang trong', async () => {
    serveList([]);
    renderWithProviders(<PendingRecipesPage />);
    expect(await screen.findByText('Không có công thức chờ duyệt')).toBeInTheDocument();
  });

  it('mo hop thoai chi tiet: tai du lieu rieng va sap xep nguyen lieu theo thu tu', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Phở bò' });

    expect(await within(dialog).findByText('Xương')).toBeInTheDocument();
    // Xoa khi sap xep theo `sortOrder`, khong phai thu tu backend tra ve.
    const items = within(dialog).getAllByRole('listitem').map((li) => li.textContent);
    expect(items[0]).toContain('Xương');
    expect(items[1]).toContain('Bò');
    expect(within(dialog).getByText('Rửa xương')).toBeInTheDocument();
  });

  it('hop thoai chi tiet dinh dang so theo Viet (BR) va can phai', async () => {
    serveList([summary({ cookTimeMinutes: 120, prepTimeMinutes: 30 })]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Phở bò' });
    expect(await within(dialog).findByText('120 phút')).toBeInTheDocument();
    // 30 + 120
    expect(within(dialog).getByText('150 phút')).toBeInTheDocument();
    expect(within(dialog).getByText('650 kcal')).toBeInTheDocument();
  });

  it('mo xac nhan tu hop thoai chi tiet thi dong hop thoai chi tiet (khong chong modal)', async () => {
    serveList([summary()]);
    renderWithProviders(<PendingRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    const detailDialog = await screen.findByRole('dialog', { name: 'Phở bò' });
    fireEvent.click(within(detailDialog).getByRole('button', { name: 'Duyệt' }));

    expect(await screen.findByRole('dialog', { name: 'Duyệt công thức' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Phở bò' })).not.toBeInTheDocument();
    // Chỉ còn một hop thoai: tranh truong hop hai `Modal` cung khoa cuon trang
    // va giai phong sai lam trang bi khoa cuon vinh vien.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });
});

// --- AllRecipesPage -----------------------------------------------------------

describe('AllRecipesPage', () => {
  it('mac dinh khong loc trang thai, co day du muc loc', async () => {
    serveList([summary()]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    expect(requestedUrls()[0]).not.toContain('status=');
    // Phai khoanh vung theo `<nav>` - nhan "Từ chối" / "Đã duyệt" trung ten
    // voi nut thao tac cua dong cong thuc.
    const tabs = within(screen.getByRole('navigation', { name: 'Lọc theo trạng thái' }));
    expect(tabs.getAllByRole('button')).toHaveLength(RECIPE_TAB_ORDER.length);
    for (const status of RECIPE_TAB_ORDER) {
      expect(tabs.getByRole('button', { name: tabLabel(status) })).toBeInTheDocument();
    }
  });

  it('bam muc loc thi gui status tuong ung va ve trang dau', async () => {
    serveList([summary()], 30);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    const tabs = () => within(screen.getByRole('navigation', { name: 'Lọc theo trạng thái' }));
    // Sang trang 2 truoc, de kiem tra viec doi loc dua ve trang 1.
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    await waitFor(() => expect(requestedUrls().some((u) => u.includes('page=1'))).toBe(true));

    fireEvent.click(tabs().getByRole('button', { name: 'Đã duyệt' }));
    await waitFor(() => {
      const last = requestedUrls().at(-1) as string;
      expect(last).toContain('status=APPROVED');
      expect(last).toContain('page=0');
    });
  });

  it('tim kiem chi chay khi bam Enter, khong phai moi ky tu', async () => {
    serveList([summary()]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());
    const callsAfterLoad = get.mock.calls.length;

    const input = screen.getByLabelText('Tìm công thức');
    fireEvent.change(input, { target: { value: 'pho' } });
    expect(get.mock.calls.length).toBe(callsAfterLoad);

    fireEvent.submit(input.closest('form') as HTMLFormElement);
    await waitFor(() => expect(requestedUrls().at(-1)).toContain('search=pho'));
  });

  it('nut "Xoa" xoa ca o nhap va dieu kien tim', async () => {
    serveList([summary()]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Tìm công thức'), { target: { value: 'pho' } });
    fireEvent.submit(screen.getByLabelText('Tìm công thức').closest('form') as HTMLFormElement);
    await waitFor(() => expect(requestedUrls().at(-1)).toContain('search=pho'));

    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(screen.getByLabelText('Tìm công thức')).toHaveValue('');
    await waitFor(() => expect(requestedUrls().at(-1)).not.toContain('search='));
  });

  it('bam sap xep theo cot ho tro thi chuyen sang sap xep o may chu', async () => {
    serveList([summary()]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Tên công thức/ }));
    await waitFor(() => {
      const last = requestedUrls().at(-1) as string;
      expect(last).toContain('sortBy=title');
      expect(last).toContain('sortDirection=asc');
    });
  });

  it('cot khong ho tro sap xep thi khong co nut sap xep', async () => {
    serveList([summary()]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: /Ngày tạo/ })).toBeInTheDocument();
    // "Trang thai" khong nam trong danh sach `sortBy` cua backend nen
    // khong duoc render nut - bam vao se nhan [REC-05].
    expect(screen.queryByRole('button', { name: /Trạng thái/ })).not.toBeInTheDocument();
  });

  it('APPROVED: chi An, khong Duyet (chon het cho trang thai)', async () => {
    serveList([summary({ status: 'APPROVED' })]);
    renderWithProviders(<AllRecipesPage />);
    // Cho vao bang, khong cho vao nhan cua muc loc - nhan "Đã duyệt" cua muc
    // loc cung trung ten voi badge trong dong nen khong phai dieu kien cho san.
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    const row = bodyRows()[0];
    expect(within(row).getByText('Đã duyệt')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Ẩn' })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Duyệt' })).not.toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Từ chối' })).not.toBeInTheDocument();
  });

  it('an: xac nhan truoc roi moi goi PATCH hide', async () => {
    serveList([summary({ status: 'APPROVED' })]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Ẩn' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ẩn công thức' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ẩn' }));
    await waitFor(() => expect(patch).toHaveBeenCalledWith('/admin/recipes/r-1/hide'));
  });

  it('HIDDEN khong co nut khoi phuc vi backend chua co endpoint', async () => {
    serveList([summary({ status: 'HIDDEN' })]);
    renderWithProviders(<AllRecipesPage />);
    // Cho vao bang chu khong cho vao badge trong dong - "Đã ẩn" cung la ten
    // muc loc nen xuat hien ngay tu luc render, dung lam dieu kien cho san.
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    const row = bodyRows()[0];
    expect(within(row).getByText('Đã ẩn')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Xem' })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Ẩn' })).not.toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Duyệt' })).not.toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Từ chối' })).not.toBeInTheDocument();
  });

  it('tim khong ra gi thi thong bao rong khac voi bang rong', async () => {
    serveList([]);
    renderWithProviders(<AllRecipesPage />);
    fireEvent.change(screen.getByLabelText('Tìm công thức'), { target: { value: 'xyz' } });
    fireEvent.submit(screen.getByLabelText('Tìm công thức').closest('form') as HTMLFormElement);
    expect(await screen.findByText('Không tìm thấy công thức nào')).toBeInTheDocument();
  });

  it('sai trang thai thu hien trong hop thoai chi tiet', async () => {
    serveList([summary({ status: 'REJECTED', rejectionReason: 'Thiếu hình ảnh' })]);
    renderWithProviders(<AllRecipesPage />);
    await waitFor(() => expect(screen.getByText('Phở bò')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Phở bò' });
    expect(await within(dialog).findByText('Lý do từ chối')).toBeInTheDocument();
    expect(within(dialog).getByText('Thiếu hình ảnh')).toBeInTheDocument();
  });
});
