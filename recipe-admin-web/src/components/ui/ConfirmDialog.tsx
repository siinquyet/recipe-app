import clsx from 'clsx';
import { Modal } from './Modal';

/**
 * Hop thoai xac nhan, dung khi thao tac khong the undo (duyet, tu choi,
 * khoa tai khoan, xoa).
 *
 * `loading` vo hieu hoa ca hai nut de khong gui trung yeu cau khi admin
 * bam lien tuc - truong hop thuong gap khi API cham.
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'primary',
  loading = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger: cho thao tac phu bien (tu choi, xoa, khoa) */
  variant?: 'primary' | 'danger';
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      size="sm"
      closeOnOverlay={!loading}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50',
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-gray-700">{message}</div>
    </Modal>
  );
}
