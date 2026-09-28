import clsx from 'clsx';
import { formatReferenceDateTime, referenceSyncState, type SyncState } from './referenceQuery';

const TONE_CLASS: Record<SyncState['tone'], string> = {
  green: 'bg-green-100 text-green-700',
  gray: 'bg-gray-100 text-gray-700',
};

/**
 * Badge trang thai dong bo cua mot reference suy ra tu `lastSyncedAt`.
 *
 * - chua co lan dong bo (null): "Chu dong bo" xam,
 * - da dong bo: "Da dong bo" xanh + ngay gio gan ben.
 *
 * Backend khong co endpoint sync (DEFER-13) nen day chi la trang thai doc tu
 * du lieu, khong co nut de bat dau dong bo.
 */
export function SyncStatusBadge({ syncedAt }: { syncedAt: string | null | undefined }) {
  const state = referenceSyncState(syncedAt);
  const dateTime = state.syncedAt ? formatReferenceDateTime(state.syncedAt) : '';

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={clsx('inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap', TONE_CLASS[state.tone])}
      >
        {state.label}
      </span>
      {dateTime ? <span className="text-xs text-gray-500">{dateTime}</span> : null}
    </span>
  );
}