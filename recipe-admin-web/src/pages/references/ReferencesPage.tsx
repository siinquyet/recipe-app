import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { extractApiMessage } from '../../api/errorMessage';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { FormField } from '../../components/ui/FormField';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SyncStatusBadge } from './SyncStatusBadge';
import {
  REFERENCE_PAGE_SIZE,
  fetchReferences,
  formatReferenceScores,
  referenceKeys,
  type RecipeReference,
} from './referenceQuery';

/**
 * Quan ly Recipe Reference (FR-ADM-04) - theo doi cac cong thuc ngoai (Spoonacular).
 *
 * Cot theo README (spec FR-ADM-04): STT, Title, External ID, Status (Badge),
 * Scores, Last Synced. Plan ghi cot "Source" nhung README ghi "Scores" - user
 * chot theo README (xem ledger Task 32).
 *
 * KHONG co nut "Sync now": backend khong co endpoint sync nao (DEFER-13), nen
 * khong ve cot Actions voi nut ma chac chan se goi vao 404.
 *
 * Tim kiem chay **may chu** (`search` khop `title`) khi bam Enter / nut "Tim".
 * KHONG co loc trang thai / sap xep: README khong yeu cau, va `sort` cua API
 * khong lo dinh dang ham y (gia tri sai => 500).
 */
export default function ReferencesPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const query = { page, size: REFERENCE_PAGE_SIZE, search };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: referenceKeys.list(query),
    queryFn: () => fetchReferences(query),
    placeholderData: (prev) => prev,
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

  const columns: Column<RecipeReference>[] = [
    {
      key: 'title',
      header: 'Tên',
      sortable: false,
      render: (r) => <span className="font-medium max-w-[280px] truncate inline-block align-bottom">{r.title || '—'}</span>,
    },
    {
      key: 'externalId',
      header: 'ID ngoài',
      sortable: false,
      render: (r) => <span className="text-gray-600">{r.externalId || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: false,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'scores',
      header: 'Điểm',
      numeric: true,
      sortable: false,
      render: (r) => formatReferenceScores(r) ?? '—',
    },
    {
      key: 'lastSyncedAt',
      header: 'Lần đồng bộ',
      sortable: false,
      render: (r) => <SyncStatusBadge syncedAt={r.lastSyncedAt} />,
    },
  ];

  const hasSearch = search !== '';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Quản lý References</h2>
        <span className="text-sm text-gray-500" aria-live="polite">
          {isFetching ? 'Đang tải… ' : ''}
          {data ? `${data.totalElements} references` : ''}
        </span>
      </div>

      <form onSubmit={submitSearch} className="flex items-end gap-2 mb-4 max-w-xl">
        <div className="flex-1">
          <FormField
            label="Tìm reference"
            name="search"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Tên công thức ngoài (Spoonacular)"
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
        message={error ? extractApiMessage(error, 'Lỗi tải danh sách references') : null}
      />

      <DataTable
        columns={columns}
        rows={data?.content ?? []}
        rowKey={(r) => r.id}
        page={page}
        pageSize={REFERENCE_PAGE_SIZE}
        totalItems={data?.totalElements}
        onPageChange={setPage}
        loading={isLoading}
        emptyMessage={hasSearch ? 'Không tìm thấy reference nào' : 'Chưa có reference nào'}
      />
    </div>
  );
}