import { formatVn } from '@shared/number';
import clsx from 'clsx';

/**
 * Hien thi con so theo quy tac BR: dinh dang Viet + CAN PHAI.
 *
 * Dinh dang chuan Viet tach ngan hang bang DAU CHAM (1.500.000), khac voi
 * dau phay (1,500,000) cua tieng Anh. Dung `formatVn` tu @shared de web
 * admin va app Android hien thi giong het nhau.
 */
export function NumberDisplay({
  value,
  suffix,
  prefix,
  className,
  title,
}: {
  value: number | string | null | undefined;
  /** Don vi ngan sau so, vd "nguoi", "phut", "mon" */
  suffix?: string;
  /** Ky tu gan truoc, vd "~", "+" */
  prefix?: string;
  className?: string;
  title?: string;
}) {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  const safe = typeof n === 'number' && Number.isFinite(n) ? n : 0;

  return (
    <span
      className={clsx('number-vn text-right', className)}
      title={title}
      // eslint-disable-next-line react/no-unescaped-entities
    >
      {prefix}
      {formatVn(safe)}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

/**
 * Hien thi chuoi chu theo quy tac BR: CAN TRAI.
 *
 * Chi nen dung khi gia tri la so - con so thi dung `NumberDisplay`.
 */
export function TextDisplay({
  value,
  className,
  title,
}: {
  value: string | null | undefined;
  className?: string;
  title?: string;
}) {
  return (
    <span className={clsx('text-left', className)} title={title}>
      {value ?? ''}
    </span>
  );
}
