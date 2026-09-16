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

// BR-UI: Chip chọn/bỏ chọn dùng cho category, filter, quick action
export const Chip: FC<ChipProps> = ({ nhan, chon = false, khiBam, bieuTuong: Icon, coTheXoa = false, className = '' }) => (
  <Pressable
    accessibilityRole="button"
    onPress={khiBam}
    className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
      chon ? 'border-primary bg-primary' : 'border-neutral-300 bg-white'
    } ${className}`}
  >
    {Icon ? <Icon size={14} color={chon ? '#fff' : '#737373'} /> : null}
    <Text className={`text-sm ${chon ? 'font-medium text-white' : 'text-neutral-700'}`}>{nhan}</Text>
    {coTheXoa ? <Text className={`text-base leading-none ${chon ? 'text-white' : 'text-neutral-400'}`}>×</Text> : null}
  </Pressable>
);
