import clsx from 'clsx';

/**
 * Thong bao loi cua thao tac, hien tren dau trang.
 *
 * `role="alert"` de may doc man hinh doc ngay khi thong bao xuat hien, va noi
 * dung ghi ro ma loi backend (`[ADM-05]`...) de quan tri vien doi chieu duoc
 * voi tai lieu. Khi co `onDismiss` thi hien nut dong - loi cua thao tac da
 * that bai thi thong bao khong nen luu lai tren man hinh.
 */
export function ErrorBanner({
  message,
  onDismiss,
  className,
}: {
  message: string | null | undefined;
  onDismiss?: () => void;
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={clsx(
        'mb-4 px-4 py-3 rounded-lg text-sm flex items-start justify-between gap-3',
        'bg-red-50 text-red-700',
        className,
      )}
    >
      <span className="whitespace-pre-line">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo lỗi"
          className="shrink-0 text-red-400 hover:text-red-700 text-lg leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
}
