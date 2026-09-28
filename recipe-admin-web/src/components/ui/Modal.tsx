import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Hop thoai nen. Bam ra ngoai hoac phim Escape de dong.
 *
 * Khong dung thu vien ngoai vi (@headlessui/react co san nhung chua dung
 * o dau trong project) - thu vien chuoi dung mot lan cho mot hop thoai don
 * gian thi la thua.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}) {
  // Escape dong hop thoai
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    // Khoa cuon trang nen khi hop thoai mo
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const WIDTH: Record<NonNullable<typeof size>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      // Bam vao chinh lop nen (khong phai panel ben trong) moi dong
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'w-full bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col',
          WIDTH[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
