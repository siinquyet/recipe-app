import type { FC } from 'react';
import { Text } from 'react-native';
import { formatVn } from '../../lib/utils/dinh-dang';

interface NumberDisplayProps {
  value: number | string;
  unit?: string;
  className?: string;
  soDongToiDa?: number;
}

// BR-UI: Số căn phải + format VN (1.000)
export const NumberDisplay: FC<NumberDisplayProps> = ({
  value,
  unit = '',
  className = '',
  soDongToiDa = 1,
}) => (
  <Text
    className={`text-right tabular-nums text-base text-neutral-900 ${className}`}
    numberOfLines={soDongToiDa}
  >
    {`${formatVn(value)}${unit ? ` ${unit}` : ''}`}
  </Text>
);
