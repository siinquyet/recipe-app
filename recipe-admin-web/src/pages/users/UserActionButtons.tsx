import clsx from 'clsx';
import { allowedUserActions, USER_ACTION_LABEL, type UserAction } from './userQuery';
import type { AdminUser } from './userQuery';

const BTN = 'px-2.5 py-1 text-xs font-medium rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Cuc nut thao tac cua mot dong nguoi dung.
 *
 * Chi render nut ma backend cho phep (`allowedUserActions`). Truoc day trang
 * nguoi dung hien "Khoa" cho ca tai khoan ADMIN, bam vao nhan
 * `409 [ADM-04] Khong the khoa tai khoan ADMIN` - day la quy tac cua
 * `admin.service.ts`, dua ve mot cho de UI khong the hien nut chap vo.
 *
 * Component nay khong giup gi - chi la hang nut. Hop thoai xac nhan nam o
 * `UsersPage` de trang nay khong phai keo theo mot lop trang thai rieng.
 */
export function UserActionButtons({
  user,
  onView,
  onRun,
  busy = false,
  showView = true,
}: {
  user: AdminUser;
  onView: (user: AdminUser) => void;
  onRun: (action: UserAction, user: AdminUser) => void;
  /** Thao tac dang chay o dau do, de vo hieu hoa dung nut do. */
  busy?: boolean;
  /** An nut "Xem" khi dang o trong chinh hop thoai chi tiet (nut vo nghia). */
  showView?: boolean;
}) {
  const actions = allowedUserActions(user);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showView && (
        <button
          type="button"
          onClick={() => onView(user)}
          className={clsx(BTN, 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')}
        >
          Xem
        </button>
      )}
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onRun(action, user)}
          disabled={busy}
          className={clsx(
            BTN,
            action === 'ban'
              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
              : 'bg-green-600 text-white border-green-600 hover:bg-green-700',
          )}
        >
          {USER_ACTION_LABEL[action]}
        </button>
      ))}
    </div>
  );
}
