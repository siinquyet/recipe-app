import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { formatVn } from '@shared/number';
import { calcStt, totalPages, sortRows, type SortDirection } from './tableLogic';

export interface Column<T> {
  key: string;
  header: string;
  /**
   * Cot chua SO: dinh dang Viet (1.500) va CAN PHAI theo BR.
   * Mac dinh false -> cot CAN TRAI.
   */
  numeric?: boolean;
  /** Ghi de noi dung o va. Luon dung cho cot nut thao tac. */
  render?: (row: T, index: number) => React.ReactNode;
  /** Cho phep sap xep. Can `sortValue` de biet so sanh theo gi. */
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null | undefined;
  className?: string;
}

const BTN =
  'px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed';
const BTN_ACTIVE = 'bg-blue-600 text-white border-blue-600';
const BTN_IDLE = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';

/**
 * Bang du lieu dung chung: tu dong cot STT, sap xep, phan trang.
 *
 * BR-01: cot STT la SO THU TU HIEN THI, khong phai ID cua ban ghi. STT duoc
 * tinh boi `calcStt` nen trang sau van bat dau dung so (trang 2 bat dau tu
 * 11 chu khong phai lai tu 1).
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  page = 0,
  pageSize = 10,
  totalItems,
  onPageChange,
  onSortChange,
  emptyMessage = 'Chưa có dữ liệu',
  loading = false,
  onRowClick,
  sortable = false,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Trang hien tai, 0-based (khop voi tham so `page` cua API) */
  page?: number;
  pageSize?: number;
  /** Tong so ban ghi cua tat ca cac trang. Bo qua phan trang neu khong co. */
  totalItems?: number;
  onPageChange?: (page: number) => void;
  /** Goi khi nguoi dung doi chieu sap xep. Bang van sap xep ben client. */
  onSortChange?: (key: string, direction: SortDirection) => void;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  /** Bat sap xep cho TAT CA cot. Cot nao tu cho `sortable: false` se bi loai. */
  sortable?: boolean;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  /**
   * Gia tri sap xep cua mot cot.
   *
   * `sortable` o cap bang bat cho TAT CA cot; khi do so sanh theo chinh truong
   * `key`. Do chi doc field cua ban ghi, nen thuoc tinh `render` tuy chon khong
   * anh huong - sap xep theo du lieu goc, khong theo chuoi da render.
   */
  function valueOf(col: Column<T>): (row: T) => string | number | null | undefined {
    if (col.sortValue) return col.sortValue;
    return (row) => {
      const v = (row as Record<string, unknown>)[col.key];
      return v == null ? null : (v as string | number);
    };
  }

  function canSort(col: Column<T>): boolean {
    return col.sortable ?? sortable;
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    return sortRows(rows, valueOf(col), sortDir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns, sortKey, sortDir, sortable]);

  function toggleSort(col: Column<T>) {
    if (!canSort(col)) return;
    const dir: SortDirection = sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(col.key);
    setSortDir(dir);
    onSortChange?.(col.key, dir);
  }

  const tp = totalItems != null ? totalPages(totalItems, pageSize) : 0;
  const showPager = tp > 1 && onPageChange != null;
  // +1 cho cot STT tu them
  const colSpan = columns.length + 1;

  function cell(row: T, col: Column<T>, index: number) {
    if (col.render) return col.render(row, index);
    const v = (row as Record<string, unknown>)[col.key];
    if (v == null || v === '') return <span className="text-gray-400">—</span>;
    if (col.numeric) return formatVn(Number(v) || 0);
    return String(v);
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 w-16">
                STT
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-sm font-medium text-gray-600',
                    col.numeric ? 'text-right' : 'text-left',
                    col.className,
                  )}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {canSort(col) ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={clsx(
                        'inline-flex items-center gap-1 hover:text-gray-900',
                        col.numeric && 'flex-row-reverse',
                      )}
                    >
                      {col.header}
                      <span aria-hidden className="text-xs">
                        {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8 text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}
                >
                  {/* BR-01: so thu tu hien thi, khong phai ID */}
                  <td className="text-right px-4 py-3 text-sm number-vn">
                    {formatVn(calcStt(i, page, pageSize))}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'px-4 py-3 text-sm',
                        col.numeric ? 'text-right number-vn' : 'text-left',
                        col.className,
                      )}
                    >
                      {cell(row, col, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPager && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Tổng: {formatVn(totalItems ?? rows.length)} bản ghi
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 0}
              className={clsx(BTN, BTN_IDLE)}
            >
              Trước
            </button>
            {pageWindow(page, tp).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                className={clsx(BTN, p === page ? BTN_ACTIVE : BTN_IDLE)}
              >
                {formatVn(p + 1)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= tp - 1}
              className={clsx(BTN, BTN_IDLE)}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Cửa sổ so trang hien thi: luon lay `current` va vai trang hai ben.
 * Danh sach 1.235 trang neu render het se lam bang khong dung duoc.
 */
function pageWindow(current: number, total: number, span = 2): number[] {
  const start = Math.max(0, Math.min(current - span, total - span * 2 - 1));
  const end = Math.min(total - 1, start + span * 2);
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}
