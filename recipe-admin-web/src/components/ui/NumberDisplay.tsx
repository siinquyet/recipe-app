import type { FC } from 'react';
import { formatVn } from '@cook/shared';

interface NumberDisplayProps {
  value: number;
  unit?: string;
  className?: string;
}

// BR-UI: Số căn phải + format VN, tái dùng formatVn shared với mobile
export const NumberDisplay: FC<NumberDisplayProps> = ({ value, unit = '', className = '' }) => (
  <span className={`number-vn ${className}`}>
    {formatVn(value)} {unit}
  </span>
);
