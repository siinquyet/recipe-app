import clsx from 'clsx';
import { BodyText } from '../../components/ui/BodyText';
import { Modal } from '../../components/ui/Modal';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UserActionButtons } from './UserActionButtons';
import {
  allowedUserActions,
  formatUserDateTime,
  isUserRole,
  userRoleLabel,
  userStatusLabel,
  type AdminUser,
  type UserAction,
} from './userQuery';

/**
 * Hop thoai xem chi tiet mot tai khoan.
 *
 * Dung du lieu cua dong trong bang, KHONG goi `GET /admin/users/:id`: backend
 * khong co endpoint do (chi co `GET /admin/users` va
 * `PATCH /admin/users/:id/status`), va `select` cua `findAllUsers` da tra du
 * het truong can xem - them request chi de lay lai dung thong tin da co san la
 * mot lan fetch thua.
 *
 * Con so dung `NumberDisplay` de dinh dang Viet + can phai theo BR.
 */
export function UserDetailModal({
  user,
  onClose,
  onRun,
  busy = false,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onRun: (action: UserAction, user: AdminUser) => void;
  busy?: boolean;
}) {
  return (
    <Modal
      open={user != null}
      onClose={onClose}
      title={user ? user.displayName : 'Chi tiết người dùng'}
      size="lg"
      footer={
        user ? (
          <UserActionButtons
            user={user}
            onView={() => {}}
            onRun={onRun}
            busy={busy}
            showView={false}
          />
        ) : null
      }
    >
      {user && <DetailBody user={user} />}
    </Modal>
  );
}

function DetailBody({ user }: { user: AdminUser }) {
  const actions = allowedUserActions(user);

  return (
    <div className="space-y-5 text-sm">
      <header className="flex flex-wrap items-center gap-2">
        <StatusBadge status={user.status} label={userStatusLabel(user.status)} />
        <RoleBadge role={user.role} />
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Field label="Email">{user.email || '—'}</Field>
        <Field label="Ngày tạo">{formatUserDateTime(user.createdAt) || '—'}</Field>
        <Field label="Cập nhật">{formatUserDateTime(user.updatedAt) || '—'}</Field>
      </dl>

      <section>
        {/* KHONG goi tieu de la "Hoat dong": badge trang thai ben tren da la
            "Hoat dong" roi, de trung ten se lam quan tri vien tuong la so lieu
            ben duoi cung la trang thai tai khoan. */}
        <BodyText bold className="mb-2">
          Tương tác
        </BodyText>
        <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
          <Field label="Công thức">
            <NumberDisplay value={user._count.recipes} suffix="món" />
          </Field>
          <Field label="Bình luận">
            <NumberDisplay value={user._count.comments} suffix="bài" />
          </Field>
          <Field label="Yêu thích">
            <NumberDisplay value={user._count.favorites} suffix="món" />
          </Field>
        </dl>
      </section>

      {actions.length === 0 && (
        // Khong bo trong im lang: admin that se bam "Khoa" roi nhan 409 neu
        // khong co gi giai thich. Noi dung **dung ly do** - `actions` rong ca
        // khi thieu truong `role`, khong chi khi la quan tri vien.
        <BodyText muted className="text-xs">
          {isUserRole(user.role)
            ? 'Tài khoản quản trị viên không thể khóa từ giao diện này.'
            : 'Không đọc được vai trò của tài khoản nên đã ẩn nút khóa — phản hồi từ máy chủ có vẻ thiếu trường `role`.'}
        </BodyText>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}

const ROLE_TONE: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
};

export function RoleBadge({ role }: { role: string | null | undefined }) {
  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 rounded text-xs font-medium',
        ROLE_TONE[String(role ?? '').toUpperCase()] ?? 'bg-gray-100 text-gray-700',
      )}
    >
      {userRoleLabel(role) || '—'}
    </span>
  );
}
