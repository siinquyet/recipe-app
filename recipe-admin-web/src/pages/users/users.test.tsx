/**
 * Test cho trang quan tri nguoi dung (Task 31).
 *
 * Tach hai lop:
 * - logic thuan trong `userQuery.ts` (dung tham so, quy tac khoa tai khoan) -
 *   test khong can DOM, va la noi duy nhat quy tac FR-ADM-01 co mot noi de so,
 * - component - test bang DOM thong qua `renderWithProviders`, voi `apiClient`
 *   gia lap nen khong cham backend that.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import { apiClient } from '../../api/client';
import UsersPage from './UsersPage';
import { UserActionButtons } from './UserActionButtons';
import {
  USER_PAGE_SIZE,
  allowedUserActions,
  buildUserListParams,
  formatUserDate,
  isUserRole,
  isUserStatus,
  nextStatus,
  userRoleLabel,
  userStatusLabel,
  type AdminUser,
} from './userQuery';

vi.mock('../../api/client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const get = vi.mocked(apiClient.get);
const patch = vi.mocked(apiClient.patch);

// --- Fixture ------------------------------------------------------------------

function user(over: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'u-1',
    email: 'nguyenvana@cookbook.vn',
    displayName: 'Nguyễn Văn A',
    avatarUrl: null,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: '2026-09-01T03:00:00.000Z',
    updatedAt: '2026-09-01T03:00:00.000Z',
    _count: { recipes: 5, comments: 2, favorites: 9 },
    ...over,
  };
}

function paged<T>(content: T[], totalElements = content.length) {
  return {
    content,
    pageable: { pageNumber: 0, pageSize: USER_PAGE_SIZE },
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / USER_PAGE_SIZE)),
  };
}

function serveList(content: AdminUser[], totalElements?: number) {
  get.mockImplementation((url: unknown) => {
    const u = String(url);
    if (u.startsWith('/admin/users?')) {
      return Promise.resolve({ data: paged(content, totalElements) } as never);
    }
    return Promise.reject(new Error(`URL khong mong doi: ${u}`));
  });
}

/** Loi 409/400 cua backend, dung kieu axios ma trang doc qua `extractApiMessage`. */
function apiError(status: number, message: string) {
  return {
    isAxiosError: true,
    response: { status, data: { statusCode: status, message } },
  };
}

function requestedUrls(): string[] {
  return get.mock.calls.map((c) => String(c[0]));
}

/**
 * Cac dong du lieu cua bang (bo dong tieu de).
 *
 * Phai khoanh vung theo dong truoc khi kiem tra nut: khong co muc loc trong trang
 * nay, nhung "Khoa" / "Mo khoa" van trung nhau giua cac dong (nhieu nguoi dung
 * cung ACTIVE), nen `screen.getByRole` bao loi nhieu phan tu - loi cua test chu
 * khong phai loi cua trang.
 */
function bodyRows(): HTMLElement[] {
  return screen.getAllByRole('row').slice(1);
}

beforeEach(() => {
  get.mockReset();
  patch.mockReset();
  patch.mockResolvedValue({ data: { status: 'BANNED' } } as never);
});

// =============================================================================
describe('userQuery - tham so truy van', () => {
  it('mac dinh gui page=0 va size=10', () => {
    const params = buildUserListParams();
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe('10');
  });

  it('size > 50 bi cat ve 50 (khop @Max cua backend)', () => {
    expect(buildUserListParams({ size: 999 }).get('size')).toBe('50');
  });

  it('size khong hop le roi ve mac dinh thay vi gui di', () => {
    expect(buildUserListParams({ size: 0 }).get('size')).toBe('10');
    expect(buildUserListParams({ size: -5 }).get('size')).toBe('10');
    expect(buildUserListParams({ size: Number.NaN }).get('size')).toBe('10');
  });

  it('page am roi ve 0', () => {
    expect(buildUserListParams({ page: -3 }).get('page')).toBe('0');
  });

  it('search rong/khong cat thi KHONG gui tham so', () => {
    expect(buildUserListParams({ search: '' }).has('search')).toBe(false);
    expect(buildUserListParams({ search: '   ' }).has('search')).toBe(false);
    expect(buildUserListParams().has('search')).toBe(false);
  });

  it('search co dau @ (email) va dau cach duoc ma hoa dung', () => {
    const params = buildUserListParams({ search: 'a b@x.vn' });
    expect(params.get('search')).toBe('a b@x.vn');
    // Khong duoc lam hong URL: `&` khong duoc chen vao giua.
    expect(params.toString()).toContain('search=a+b%40x.vn');
  });

  it('KHONG gui status/sortBy - AdminUserQueryDto khong nhan (forbidNonWhitelisted -> 400)', () => {
    const params = buildUserListParams({
      // Test co y dieu kien "truyen thu ngoai danh sach" phai bi loai bo.
      ...({ status: 'BANNED', sortBy: 'email', sortDirection: 'asc' } as object),
    } as never);
    expect(params.has('status')).toBe(false);
    expect(params.has('sortBy')).toBe(false);
    expect(params.has('sortDirection')).toBe(false);
  });
});

// =============================================================================
describe('userQuery - quy tac khoa tai khoan (FR-ADM-01)', () => {
  it('USER dang hoat dong -> chi khoa', () => {
    expect(allowedUserActions(user({ role: 'USER', status: 'ACTIVE' }))).toEqual(['ban']);
  });

  it('USER da khoa -> chi mo khoa', () => {
    expect(allowedUserActions(user({ role: 'USER', status: 'BANNED' }))).toEqual(['unban']);
  });

  it('ADMIN khong co nut nao ca hai huong (ADM-04 chan moi thao tac)', () => {
    expect(allowedUserActions(user({ role: 'ADMIN', status: 'ACTIVE' }))).toEqual([]);
  });

  it('ADMIN da khoa (sua tay DB) cung khong co nut - dieu kien backend chi xet role', () => {
    expect(allowedUserActions(user({ role: 'ADMIN', status: 'BANNED' }))).toEqual([]);
  });

  it('khong phan biet hoa thuong trong role/status', () => {
    expect(allowedUserActions({ role: 'admin', status: 'active' })).toEqual([]);
    expect(allowedUserActions({ role: 'user', status: 'banned' })).toEqual(['unban']);
  });

  it('thieu `role` thi KHONG doan - an nut (khong biet co quyen khoa hay khong)', () => {
    expect(allowedUserActions({ status: 'ACTIVE' })).toEqual([]);
    expect(allowedUserActions({ role: null, status: 'BANNED' })).toEqual([]);
    expect(allowedUserActions({ role: 'OWNER', status: 'ACTIVE' })).toEqual([]);
  });

  it('thieu `status` thi van cho phep: changeUserStatus gan thang, khong doc trang thai hien tai', () => {
    expect(allowedUserActions({ role: 'USER' })).toEqual(['ban']);
  });

  it('null/undefined thi tra mang rong thay vi nem loi', () => {
    expect(allowedUserActions(null)).toEqual([]);
    expect(allowedUserActions(undefined)).toEqual([]);
  });

  it('nextStatus doi dung chieu khoa <-> mo khoa', () => {
    expect(nextStatus('ban')).toBe('BANNED');
    expect(nextStatus('unban')).toBe('ACTIVE');
  });
});

describe('userQuery - nhan hien thi', () => {
  it('isUserStatus chi nhan ACTIVE/BANNED', () => {
    expect(isUserStatus('ACTIVE')).toBe(true);
    expect(isUserStatus('BANNED')).toBe(true);
    expect(isUserStatus('DELETED')).toBe(false);
    expect(isUserStatus(null)).toBe(false);
  });

  it('isUserRole chi nhan USER/ADMIN', () => {
    expect(isUserRole('USER')).toBe(true);
    expect(isUserRole('ADMIN')).toBe(true);
    expect(isUserRole('MODERATOR')).toBe(false);
  });

  it('nhan trang thai: ACTIVE/BANNED -> tieng Viet, gia tri la -> giu nguyen de lo du lieu sai', () => {
    expect(userStatusLabel('ACTIVE')).toBe('Hoạt động');
    expect(userStatusLabel('active')).toBe('Hoạt động');
    expect(userStatusLabel('BANNED')).toBe('Đã khóa');
    expect(userStatusLabel('KHONG_RO')).toBe('KHONG_RO');
    expect(userStatusLabel(null)).toBe('');
  });

  it('nhan vai tro: USER/ADMIN -> tieng Viet, gia tri la -> giu nguyen', () => {
    expect(userRoleLabel('ADMIN')).toBe('Quản trị viên');
    expect(userRoleLabel('USER')).toBe('Người dùng');
    expect(userRoleLabel('OWNER')).toBe('OWNER');
    expect(userRoleLabel(null)).toBe('');
  });

  it('ngay sai dinh dang tra chuoi rong thay vi "Invalid Date"', () => {
    expect(formatUserDate('2026-09-01T03:00:00.000Z')).not.toBe('');
    expect(formatUserDate('khong-phai-ngay')).toBe('');
    expect(formatUserDate(null)).toBe('');
    expect(formatUserDate(undefined)).toBe('');
  });
});

// =============================================================================
describe('UsersPage', () => {
  it('tai danh sach tu /admin/users', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(requestedUrls()[0]).toBe('/admin/users?page=0&size=10');
  });

  it('cot dung thu tu plan: ten, email, vai tro, trang thai, so cong thuc, ngay tao, thao tac', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent?.trim() ?? '');
    expect(heads).toEqual([
      'STT',
      'Tên hiển thị',
      'Email',
      'Vai trò',
      'Trạng thái',
      'Công thức',
      'Ngày tạo',
      'Thao tác',
    ]);
  });

  it('cot STT la so thu tu hien thi, KHONG phai id (BR-01)', async () => {
    serveList([user({ id: 'zzz-1' }), user({ id: 'aaa-2', displayName: 'Trần Thị B' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Trần Thị B')).toBeInTheDocument());
    const rows = bodyRows();
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveTextContent('1');
    expect(within(rows[1]).getAllByRole('cell')[0]).toHaveTextContent('2');
    // Khac nhau hoan toan voi id, nen "2" khong the la do nham.
    expect(screen.queryByText('aaa-2')).not.toBeInTheDocument();
  });

  it('khong hien cot nao sap xep - backend khong co sortBy (sap xep client se chi dung trong trang hien tai)', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.queryAllByRole('button', { expanded: false })).toHaveLength(0);
    // Tieu de cot khong phai nut sap xep.
    const th = screen.getAllByRole('columnheader');
    expect(th.every((h) => h.querySelector('button') === null)).toBe(true);
  });

  it('hien so cong thuc dinh dang Viet va can phai', async () => {
    serveList([user({ _count: { recipes: 1500, comments: 2, favorites: 9 } })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.getByText('1.500')).toBeInTheDocument();
  });

  it('vai tro va trang thai hien bang nhan tieng Viet', async () => {
    serveList([user({ role: 'ADMIN' }), user({ id: 'u-2', displayName: 'Trần Thị B', status: 'BANNED' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Trần Thị B')).toBeInTheDocument());
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
    expect(screen.getByText('Người dùng')).toBeInTheDocument();
    expect(screen.getByText('Hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Đã khóa')).toBeInTheDocument();
  });

  it('ngay tao theo dinh dang Viet, khong phai ISO thô', async () => {
    serveList([user({ createdAt: '2026-09-01T03:00:00.000Z' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/)).toBeInTheDocument();
  });

  it('USER ACTIVE chi co nut Khoa; USER BANNED chi co nut Mo khoa', async () => {
    serveList([
      user({ id: 'u-1', displayName: 'Nguyễn Văn A' }),
      user({ id: 'u-2', displayName: 'Trần Thị B', status: 'BANNED' }),
    ]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Trần Thị B')).toBeInTheDocument());
    const rows = bodyRows();
    expect(within(rows[0]).getByRole('button', { name: 'Khóa' })).toBeInTheDocument();
    expect(within(rows[0]).queryByRole('button', { name: 'Mở khóa' })).not.toBeInTheDocument();
    expect(within(rows[1]).getByRole('button', { name: 'Mở khóa' })).toBeInTheDocument();
    expect(within(rows[1]).queryByRole('button', { name: 'Khóa' })).not.toBeInTheDocument();
  });

  it('ADMIN khong co nut khoa (ADM-04 se tra 409 neu bam)', async () => {
    serveList([user({ role: 'ADMIN' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Khóa' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mở khóa' })).not.toBeInTheDocument();
    // Van co nut Xem de xem chi tiet tai khoan ADMIN.
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
  });

  it('co nut Xem cho moi dong', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
  });

  it('bam nut Khoa -> hien hop xac nhan, CHUA goi API', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));

    const dialog = await screen.findByRole('dialog', { name: 'Khóa tài khoản' });
    expect(dialog).toHaveTextContent('Nguyễn Văn A');
    expect(dialog).toHaveTextContent('nguyenvana@cookbook.vn');
    expect(patch).not.toHaveBeenCalled();
  });

  it('Xac nhan -> PATCH /admin/users/:id/status voi status BANNED', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));

    await waitFor(() => expect(patch).toHaveBeenCalledWith('/admin/users/u-1/status', { status: 'BANNED' }));
  });

  it('Xac nhan Mo khoa -> PATCH voi status ACTIVE', async () => {
    serveList([user({ status: 'BANNED' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Mở khóa' }));
    const dialog = await screen.findByRole('dialog', { name: 'Mở khóa tài khoản' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(patch).toHaveBeenCalledWith('/admin/users/u-1/status', { status: 'ACTIVE' }));
  });

  it('Huy xac nhan -> khong goi API va hop thoai dong', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Hủy' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(patch).not.toHaveBeenCalled();
  });

  it('sau thanh cong -> tai lai danh sach', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    const before = get.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(before));
  });

  it('backend tra 409 ADM-04 -> hien ErrorBanner nguyen van thong diep co ma loi', async () => {
    serveList([user({ role: 'USER' })]);
    // `serveList` mo ta tai khoan USER, nhung server tra 409 nhu la admin bi
    // khoa giua luc bam - can bat loi thay vi may cham API that.
    patch.mockRejectedValue(
      apiError(409, '[ADM-04] Không thể khóa tài khoản ADMIN'),
    );
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('[ADM-04] Không thể khóa tài khoản ADMIN');
    // Hop xac nhan dong lai, nguoi dung phai bam lai tu dau.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('backend tra loi ma khong co message -> hien thong diep du phong', async () => {
    serveList([user()]);
    patch.mockRejectedValue({ isAxiosError: true, response: { status: 500, data: {} } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Khóa tài khoản thất bại');
  });

  it('API that bai thi VAN tai lai danh sach - loi 409 chinh la bang chung cache da cu', async () => {
    // Bang van hien "Nguoi dung" / co nut "Khoa", nhung server tra "[ADM-04] ...
    // ADMIN". Giu cache se kien bang mau thuan voi thong bao loi va nguoi quan
    // tri se bam lai choi.
    serveList([user({ role: 'USER', status: 'ACTIVE' })]);
    patch.mockRejectedValue(apiError(409, '[ADM-04] Không thể khóa tài khoản ADMIN'));
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    const before = get.mock.calls.length;

    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));
    await screen.findByRole('alert');

    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(before));
  });

  it('ErrorBanner co nut dong - loi cua thao tac da that bai thi khong giu tren man hinh', async () => {
    serveList([user()]);
    patch.mockRejectedValue(apiError(409, '[ADM-04] Không thể khóa tài khoản ADMIN'));
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Khóa' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận' }));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo lỗi' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tim kiem: go chu khong goi API, bam "Tim" moi goi', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    const before = get.mock.calls.length;

    fireEvent.change(screen.getByLabelText('Tìm người dùng'), { target: { value: 'nguyen' } });
    expect(get.mock.calls.length).toBe(before);

    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    await waitFor(() =>
      expect(requestedUrls().at(-1)).toBe('/admin/users?page=0&size=10&search=nguyen'),
    );
  });

  it('tim kiem: Enter trong o cung chay tim', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Tìm người dùng'), { target: { value: 'a@x.vn' } });
    fireEvent.submit(screen.getByLabelText('Tìm người dùng').closest('form') as HTMLFormElement);
    await waitFor(() => expect(requestedUrls().at(-1)).toContain('search=a%40x.vn'));
  });

  it('nut Xoa xoa tu khoa va tai lai danh sach day du', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Tìm người dùng'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    await waitFor(() => expect(requestedUrls().at(-1)).toContain('search=abc'));

    fireEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    await waitFor(() => expect(requestedUrls().at(-1)).toBe('/admin/users?page=0&size=10'));
    expect((screen.getByLabelText('Tìm người dùng') as HTMLInputElement).value).toBe('');
  });

  it('nut Xoa chi xuat hien khi dang co dieu kien tim', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Xoá' })).not.toBeInTheDocument();
  });

  it('san trang rong: bao rieng "khong tim thay" khi dang tim, "chua co" khi khong', async () => {
    serveList([]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Chưa có người dùng')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Tìm người dùng'), { target: { value: 'khongco' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    await waitFor(() => expect(screen.getByText('Không tìm thấy người dùng nào')).toBeInTheDocument());
  });

  it('chuyen trang -> gui page moi; sang trang cuoi phai hop le', async () => {
    serveList([user()], 45);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    expect(screen.getByText('Trước')).toBeDisabled();
    expect(screen.getByText('Sau')).not.toBeDisabled();

    fireEvent.click(screen.getByText('Sau'));
    await waitFor(() => expect(requestedUrls().at(-1)).toBe('/admin/users?page=1&size=10'));
  });

  it('tim kiem khong rong -> phai ve trang 1 (du lieu trang cu khong con thuoc bo loc moi)', async () => {
    serveList([user()], 45);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sau'));
    await waitFor(() => expect(requestedUrls().at(-1)).toBe('/admin/users?page=1&size=10'));

    fireEvent.change(screen.getByLabelText('Tìm người dùng'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    await waitFor(() => expect(requestedUrls().at(-1)).toBe('/admin/users?page=0&size=10&search=abc'));
  });

  it('lỗi tai danh sach -> hien ErrorBanner thay vi bang rong khong giai thich', async () => {
    get.mockRejectedValue(apiError(500, '[ADM-09] Lỗi hệ thống'));
    renderWithProviders(<UsersPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('[ADM-09] Lỗi hệ thống');
  });
});

// =============================================================================
describe('UserDetailModal', () => {
  it('bam Xem -> hien hop chi tiet voi ten tai khoan', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    expect(dialog).toHaveTextContent('nguyenvana@cookbook.vn');
    expect(dialog).toHaveTextContent('Người dùng');
    expect(dialog).toHaveTextContent('Hoạt động');
  });

  it('chi tiet hien so lieu _count ma backend da tra san', async () => {
    serveList([user({ _count: { recipes: 1500, comments: 12, favorites: 340 } })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    expect(dialog).toHaveTextContent('1.500');
    expect(dialog).toHaveTextContent('12');
    expect(dialog).toHaveTextContent('340');
  });

  it('chi tiet hien ngay tao va cap nhat lan cuoi', async () => {
    serveList([user({ createdAt: '2026-08-01T03:00:00.000Z', updatedAt: '2026-09-20T03:00:00.000Z' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    expect(dialog).toHaveTextContent('Ngày tạo');
    expect(dialog).toHaveTextContent('Cập nhật');
  });

  it('KHONG co nut doi vai tro - backend chua co endpoint /role (DEFER-06)', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    expect(dialog.querySelector('select')).toBeNull();
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('tai khoan ADMIN: chi tiet khong co nut khoa (ADM-04)', async () => {
    serveList([user({ role: 'ADMIN' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    expect(within(dialog).queryByRole('button', { name: 'Khóa' })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent('Quản trị viên');
  });

  it('tai khoan USER: chi tiet co nut khoa, bam -> xac nhan (chi 1 modal mot luc)', async () => {
    serveList([user({ role: 'USER' })]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));

    const dialog = await screen.findByRole('dialog', { name: 'Nguyễn Văn A' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Khóa' }));

    // Chi tiet phai dong truoc, khong de hai Modal cung mot luc.
    await waitFor(() => expect(document.querySelectorAll('[role=dialog]')).toHaveLength(1));
    const confirm = screen.getByRole('dialog', { name: 'Khóa tài khoản' });
    expect(confirm).toBeInTheDocument();
  });

  it('Escape dong hop chi tiet va tra lai cuon trang', async () => {
    serveList([user()]);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Xem' }));
    await screen.findByRole('dialog');

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

// =============================================================================
describe('UserActionButtons', () => {
  function renderButtons(over: Partial<AdminUser> = {}) {
    renderWithProviders(
      <table>
        <tbody>
          <tr>
            <td>
              <UserActionButtons user={user(over)} onView={() => {}} onRun={() => {}} />
            </td>
          </tr>
        </tbody>
      </table>,
    );
  }

  it('render nut Xem + nut theo quy tac', () => {
    renderButtons({ role: 'USER', status: 'ACTIVE' });
    expect(screen.getByRole('button', { name: 'Xem' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khóa' })).toBeInTheDocument();
  });

  it('an nut Xem khi dang o trong chinh hop chi tiet', () => {
    renderWithProviders(
      <table>
        <tbody>
          <tr>
            <td>
              <UserActionButtons user={user()} onView={() => {}} onRun={() => {}} showView={false} />
            </td>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.queryByRole('button', { name: 'Xem' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khóa' })).toBeInTheDocument();
  });

  it('goi onRun dung action', () => {
    const onRun = vi.fn();
    renderWithProviders(
      <table>
        <tbody>
          <tr>
            <td>
              <UserActionButtons user={user({ status: 'BANNED' })} onView={() => {}} onRun={onRun} />
            </td>
          </tr>
        </tbody>
      </table>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mở khóa' }));
    expect(onRun).toHaveBeenCalledWith('unban', expect.objectContaining({ id: 'u-1' }));
  });
});
