import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';

interface TabBarProps {
  cacTab: string[];
  tabHienTai: number;
  khiChon: (viTri: number) => void;
}

// BR-UI: TabBar (Nguyên liệu / Bước / Dinh dưỡng) trong chi tiết công thức
export const TabBar: FC<TabBarProps> = ({ cacTab, tabHienTai, khiChon }) => (
  <View className="flex-row border-b border-neutral-200 bg-white">
    {cacTab.map((tab, i) => (
      <Pressable
        key={tab}
        accessibilityRole="tab"
        onPress={() => khiChon(i)}
        className={`flex-1 items-center border-b-2 pb-2 pt-1 ${
          tabHienTai === i ? 'border-primary' : 'border-transparent'
        }`}
      >
        <Text
          className={
            tabHienTai === i ? 'text-sm font-semibold text-primary' : 'text-sm text-neutral-500'
          }
        >
          {tab}
        </Text>
      </Pressable>
    ))}
  </View>
);
