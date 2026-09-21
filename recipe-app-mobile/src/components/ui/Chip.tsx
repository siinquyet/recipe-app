import type { FC } from 'react';
import { Pressable, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface ChipProps {
  nhan: string;
  chon?: boolean;
  khiBam?: () => void;
  bieuTuong?: LucideIcon;
  coTheXoa?: boolean;
  className?: string;
}

// BR-UI: Chip đồng bộ web Bếp Nhà — active nền teal + chữ mực, inactive nền trắng + viền mờ
export const Chip: FC<ChipProps> = ({ nhan, chon = false, khiBam, bieuTuong: Icon, coTheXoa = false, className = '' }) => (
  <Pressable
    accessibilityRole="button"
    onPress={khiBam}
    className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
      chon ? 'border-accent bg-accent' : 'border-neutral-300 bg-white'
    } ${className}`}
  >
    {Icon ? <Icon size={14} color={chon ? '#0A2533' : '#97A2B0'} /> : null}
    <Text className={`text-sm ${chon ? 'font-semibold text-primary' : 'text-neutral-700'}`}>{nhan}</Text>
    {coTheXoa ? <Text className={`text-base leading-none ${chon ? 'text-primary' : 'text-neutral-400'}`}>×</Text> : null}
  </Pressable>
);
