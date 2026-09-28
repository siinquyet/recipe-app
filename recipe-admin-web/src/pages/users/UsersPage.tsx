import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { extractApiMessage } from '../../api/errorMessage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { FormField } from '../../components/ui/FormField';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RoleBadge, UserDetailModal } from './UserDetailModal';
import { UserActionButtons } from './UserActionButtons';
import {
  USER_ACTION_TITLE,
  USER_PAGE_SIZE,
  changeUserStatus,
  fetchUsers,
  formatUserDate,
  nextStatus,
  userActionFallback,
  userKeys,
  userStatusLabel,
  type AdminUser,
  type UserAction,
} from './userQuery';

/** Thao tac can xac nhan: khong the undo. */
interface Pending {
  action: UserAction;
  user: AdminUser;
}

/**
 * Quan tri nguoi dung (FR-ADM-01) - xem, tim, khoa va mo khoa tai khoan.
 *
 * Tim kiem chay **may chu** (`AdminUserQueryDto.nhan search` khop `email` +
 * `displayName`), va chi chay khi bam Enter / nut "Tim" thay vi moi ky tu:
 * `search` khong co index nen moi lan go la mot lan quet bang.
 *
 * KHONG co loc theo vai tro / trang thai: API khong nhan tham do (gui tham so
 * ngoai danh sach se bi `forbidNonWhitelisted` tra 400), loc ben client chi
 * dung trong 10 dong dang xem. KHONG co sap xep: backend co dinh
 * `createdAt desc` va `DataTable` sap xep client-side, nen bam "Tieu de cot"
 * se tao cam giac da sap xep ca danh sach trong khi chi sap xep trang hien tai.
 */
export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const query = { page, size: USER_PAGE_SIZE, search };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => fetchUsers(query),
    placeholderData: (prev) => prev,
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: UserAction }) =>
      changeUserStatus(id, nextStatus(action)),
    onSuccess: async () => {
      setActionError(null);
      setPending(null);
      setDetailUser(null);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err, vars) => {
      setPending(null);
      setActionError(extractApiMessage(err, userActionFallback(vars.action)));
      // Tai lai danh sach **ca khi that bai**. Backend co the tra 409 vi
      // du lieu tren man hinh da cu: nguoi dung dang xem la "Nguoi dung" nhung
      // server dang tra "[ADM-04] Khong the khoa tai khoan ADMIN" - tuc la
      // server biet vai tro da doi. Neu giu nguyen cache, bang van hien "Nguoi
      // dung" va nut van con, nguoi quan tri se bam lai va nhan 409 lan nua
      // trong khi thong bao loi mau thuan voi chinh dong no dang chi.
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });

  /** Doi dieu kien tim kiem phai ve trang 1: du lieu trang cu khong thuoc bo loc moi. */
  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    setPage(0);
  }

  function askRun(action: UserAction, user: AdminUser) {
    setActionError(null);
    // Dong hop thoai chi tiet truoc khi mo hop xac nhan.
    //
    // `Modal` khoa cuon trang bang cach luu `body.style.overflow` hien tai roi gan
    // lai khi dong. Hai modal mo cung luc se pha quy tac do: ca hai deu chup
    // `''` (chua khoa) lam gia tri truoc, dong thi chung cung tra ve `''` - lan
    // nay may chay duoc, nhung neu hai modal dong cung mot luc (Escape) thi thu
    // tu khoi phuc co the ket thuc o `hidden` va trang bi khoa cuon vinh vien.
    // Mot hop thoai tai mot luc la cach suy ra duy nhat khong loi.
    setDetailUser(null);
    setPending({ action, user });
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: false,
      render: (r) => <span className="text-gray-600">{r.email || '—'}</span>,
    },
    {
      key: 'displayName',
      header: 'Tên',
      sortable: false,
      render: (r) => <span className="font-medium">{r.displayName || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Vai trò',
      sortable: false,
      render: (r) => <RoleBadge role={r.role} />,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (r) => <StatusBadge status={r.status} label={userStatusLabel(r.status)} />,
    },
    {
      key: 'recipes',
      header: 'Số công thức',
      numeric: true,
      sortable: false,
      render: (r) => <NumberDisplay value={r._count.recipes} />,
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: false,
      render: (r) => formatUserDate(r.createdAt) || '—',
    },
    {
      key: 'actions',
      header: 'Thao tác',
      sortable: false,
      render: (r) => (
        <UserActionButtons
          user={r}
          onView={setDetailUser}
          onRun={askRun}
          busy={mutation.isPending}
        />
      ),
    },
  ];

  const hasSearch = search !== '';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
        <span className="text-sm text-gray-500" aria-live="polite">
          {isFetching ? 'Đang tải… ' : ''}
          {data ? `${data.totalElements} người dùng` : ''}
        </span>
      </div>

      <form onSubmit={submitSearch} className="flex items-end gap-2 mb-4 max-w-xl">
        <div className="flex-1">
          <FormField
            label="Tìm người dùng"
            name="search"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Email hoặc tên hiển thị"
            hint="Nhấn Enter để tìm"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Tìm
        </button>
        {hasSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-3 py-2 mb-4 text-sm text-gray-600 hover:text-gray-900"
          >
            Xoá
          </button>
        )}
      </form>

      <ErrorBanner
        message={actionError ?? (error ? extractApiMessage(error, 'Lỗi tải danh sách người dùng') : null)}
        onDismiss={() => setActionError(null)}
      />

      <DataTable
        columns={columns}
        rows={data?.content ?? []}
        rowKey={(r) => r.id}
        page={page}
        pageSize={USER_PAGE_SIZE}
        totalItems={data?.totalElements}
        onPageChange={setPage}
        // Chi "Đang tải" lần đầu - lúc đổi trang giữ dữ liệu cũ để đọc.
        loading={isLoading}
        emptyMessage={hasSearch ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng'}
      />

      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onRun={askRun}
        busy={mutation.isPending}
      />

      {pending && (
        <ConfirmDialog
          open
          onCancel={() => setPending(null)}
          onConfirm={() =>
            mutation.mutate({ id: pending.user.id, action: pending.action })
          }
          title={USER_ACTION_TITLE[pending.action]}
          variant="danger"
          loading={mutation.isPending}
          message={
            <>
              <p>
                {pending.action === 'ban' ? 'Khóa' : 'Mở khóa'} tài khoản{' '}
                <strong>{pending.user.displayName}</strong> ({pending.user.email})?
              </p>
              <p className="mt-2 text-gray-600">
                {pending.action === 'ban'
                  ? 'Người dùng sẽ không đăng nhập được cho tới khi tài khoản được mở khóa.'
                  : 'Người dùng sẽ đăng nhập và dùng lại được ngay.'}
              </p>
            </>
          }
        />
      )}
    </div>
  );
}
