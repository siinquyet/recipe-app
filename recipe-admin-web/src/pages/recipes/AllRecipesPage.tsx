import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { extractApiMessage } from '../../api/errorMessage';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { FormField } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RecipeActionButtons } from './RecipeActionButtons';
import { RecipeModerationLayer } from './RecipeModerationLayer';
import {
  RECIPE_PAGE_SIZE,
  RECIPE_TAB_ORDER,
  fetchRecipes,
  formatDateVi,
  recipeKeys,
  tabLabel,
  type RecipeSortField,
  type RecipeStatus,
  type RecipeSummary,
  type SortDirection,
} from './recipeQuery';
import { useRecipeModeration } from './useRecipeModeration';

/**
 * Cot nao cho phep sap xep o phia may chu.
 *
 * Backend chi nhan `sortBy` trong `createdAt | title | updatedAt` va tra 400
 * voi `[REC-05]` neu truong khac. Nen cot khong khop danh sach nay phai de
 * `sortable: false` - con lai bam vao se nhieu mot loi ma khong can.
 */
const SORTABLE_KEYS: Record<string, RecipeSortField> = {
  title: 'title',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

/**
 * Quan ly tat ca cong thuc (FR-ADM-03) - xem, loc, tim, duyet, an.
 *
 * Loc va tim do **may chu** lam (`RecipeQueryDto` nhan `status`, `search`,
 * `sortBy`, `sortDirection`). Tim kiem chay khi bam Enter hoac nut "Tim" thay
 * vi moi ky tu: backend quet `title` + `description` + `ingredients.originalText`
 * bang `contains`, bat ky request nao cung la mot cau lenh tren MySQL.
 */
export default function AllRecipesPage() {
  const [status, setStatus] = useState<RecipeStatus | ''>('');
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<RecipeSortField | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const m = useRecipeModeration();

  const query = { status, page, size: RECIPE_PAGE_SIZE, search, sortBy, sortDirection };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: recipeKeys.list(query),
    queryFn: () => fetchRecipes(query),
    placeholderData: (prev) => prev,
  });

  /** Doi trang thai / tim kiem / sap xep phai ve trang dau, vi du lieu trang
   *  cu khong con thuoc ve bo loc moi. */
  function resetToFirstPage() {
    setPage(0);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    resetToFirstPage();
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    resetToFirstPage();
  }

  function handleSortChange(key: string, direction: SortDirection) {
    const field = SORTABLE_KEYS[key];
    if (!field) return;
    setSortBy(field);
    setSortDirection(direction);
    resetToFirstPage();
  }

  const columns: Column<RecipeSummary>[] = [
    {
      key: 'title',
      header: 'Tên công thức',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: 'author',
      header: 'Tác giả',
      sortable: false,
      render: (r) => r.author?.displayName || '—',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => formatDateVi(r.createdAt) || '—',
    },
    {
      key: 'actions',
      header: 'Thao tác',
      sortable: false,
      render: (r) => (
        <RecipeActionButtons
          recipe={{ id: r.id, title: r.title, status: r.status }}
          onView={m.openDetail}
          onApprove={(recipe) => m.askConfirm('approve', recipe)}
          onReject={m.askReject}
          onHide={(recipe) => m.askConfirm('hide', recipe)}
          busyKind={m.busyKind}
        />
      ),
    },
  ];

  const hasSearch = search !== '';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Quản lý Công thức</h2>
        <span className="text-sm text-gray-500" aria-live="polite">
          {isFetching ? 'Đang tải… ' : ''}
          {data ? `${data.totalElements} công thức` : ''}
        </span>
      </div>

      <nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-1 mb-4">
        {RECIPE_TAB_ORDER.map((value) => (
          <button
            key={value || 'ALL'}
            type="button"
            aria-current={status === value ? 'page' : undefined}
            onClick={() => {
              setStatus(value);
              resetToFirstPage();
            }}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg border',
              status === value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            )}
          >
            {tabLabel(value)}
          </button>
        ))}
      </nav>

      <form onSubmit={submitSearch} className="flex items-end gap-2 mb-4 max-w-xl">
        <div className="flex-1">
          <FormField
            label="Tìm công thức"
            name="search"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Tên, mô tả hoặc nguyên liệu"
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
        message={m.actionError ?? (error ? extractApiMessage(error, 'Lỗi tải danh sách công thức') : null)}
        onDismiss={m.dismissError}
      />

      <DataTable
        columns={columns}
        rows={data?.content ?? []}
        rowKey={(r) => r.id}
        page={page}
        pageSize={RECIPE_PAGE_SIZE}
        totalItems={data?.totalElements}
        onPageChange={setPage}
        onSortChange={handleSortChange}
        // Chi "Đang tai" lan dau - xem ghi chu o PendingRecipesPage.
        loading={isLoading}
        emptyMessage={hasSearch ? 'Không tìm thấy công thức nào' : 'Chưa có công thức'}
      />

      <RecipeModerationLayer m={m} />
    </div>
  );
}
