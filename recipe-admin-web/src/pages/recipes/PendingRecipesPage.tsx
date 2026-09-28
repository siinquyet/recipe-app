import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RecipeActionButtons } from './RecipeActionButtons';
import { RecipeModerationLayer } from './RecipeModerationLayer';
import {
  RECIPE_PAGE_SIZE,
  fetchRecipes,
  formatDateVi,
  recipeKeys,
  type RecipeSummary,
} from './recipeQuery';
import { useRecipeModeration } from './useRecipeModeration';

/**
 * Hang cho duyet: chi cac cong thuc o trang thai PENDING (FR-ADM-02).
 *
 * Phan trang do **may chu** duyet chu khong phai DataTable, vi danh sach duoc
 * tai theo trang - `calcStt` cong san offset nen cot STT van dung khi sang
 * trang. Sap xep de `sortable: false`: thu tu mac dinh cua backend la
 * `createdAt desc` va day la hang cho duyet, uu tien bai moi nhat.
 */
export default function PendingRecipesPage() {
  const [page, setPage] = useState(0);
  const m = useRecipeModeration();

  const { data, isLoading, error } = useQuery({
    queryKey: recipeKeys.list({ status: 'PENDING', page, size: RECIPE_PAGE_SIZE }),
    queryFn: () => fetchRecipes({ status: 'PENDING', page, size: RECIPE_PAGE_SIZE }),
    placeholderData: (prev) => prev,
  });

  const columns: Column<RecipeSummary>[] = [
    {
      key: 'title',
      header: 'Tên công thức',
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: 'author',
      header: 'Tác giả',
      render: (r) => r.author?.displayName || '—',
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      render: (r) => formatDateVi(r.createdAt) || '—',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (r) => <StatusBadge status={r.status} />,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Duyệt Công thức</h2>
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          {data?.totalElements ?? 0} chờ duyệt
        </span>
      </div>

      <ErrorBanner
        message={m.actionError ?? (error ? 'Không tải được danh sách công thức' : null)}
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
        // Chi "Đang tai" lan dau. Lan doi trang giu bang cu (`placeholderData`)
        // va them mot vien thong bao nho o tieu de, khong xoa sach bang.
        loading={isLoading}
        emptyMessage="Không có công thức chờ duyệt"
      />

      <RecipeModerationLayer m={m} />
    </div>
  );
}
