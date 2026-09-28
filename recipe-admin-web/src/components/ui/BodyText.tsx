import clsx from 'clsx';

export type BodyAlign = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<BodyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Wrapper cho doan van ban.
 *
 * Mac dinh CAN TRAI theo BR. Can giua chi dung cho thong bao rong / loi /
 * trang thai khong co du lieu, do nhung doan do doc lap, khong thuoc luong
 * danh sach nao nen can phai giua de ra giua vung noi dung.
 */
export function BodyText({
  children,
  align = 'left',
  className,
  muted,
  bold,
}: {
  children: React.ReactNode;
  align?: BodyAlign;
  className?: string;
  /** Chu mo nhat, dung cho phu chu, ghi chu */
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      className={clsx(
        ALIGN_CLASS[align],
        muted && 'text-gray-500',
        bold && 'font-semibold',
        className,
      )}
    >
      {children}
    </div>
  );
}
