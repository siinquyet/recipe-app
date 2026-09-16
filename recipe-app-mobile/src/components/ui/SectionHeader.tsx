import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { TitleText } from './VanBan';

interface SectionHeaderProps {
  tieuDe: string;
  khiXemTatCa?: () => void;
  className?: string;
}

// BR-UI: Tiêu đề khu vực + nút "Xem tất cả" trên Home
export const SectionHeader: FC<SectionHeaderProps> = ({ tieuDe, khiXemTatCa, className = '' }) => (
  <View className={`flex-row items-center justify-between ${className}`}>
    <TitleText className="text-lg">{tieuDe}</TitleText>
    {khiXemTatCa ? (
      <Pressable accessibilityRole="button" onPress={khiXemTatCa} className="flex-row items-center">
        <Text className="text-sm font-medium text-primary">Xem tất cả</Text>
        <ChevronRight size={16} color="#0A2533" />
      </Pressable>
    ) : null}
  </View>
);
