import type { FC } from 'react';
import { Switch, Text, View } from 'react-native';

interface OChuyenDoiProps {
  nhan: string;
  moTa?: string;
  giaTri: boolean;
  khiDoi: (giaTri: boolean) => void;
}

// BR-UI: Hàng cài đặt có công tắc bật/tắt (Settings)
export const OChuyenDoi: FC<OChuyenDoiProps> = ({ nhan, moTa, giaTri, khiDoi }) => (
  <View className="flex-row items-center justify-between py-3">
    <View className="flex-1">
      <Text className="text-left text-base text-neutral-900">{nhan}</Text>
      {moTa ? <Text className="mt-0.5 text-left text-xs text-neutral-500">{moTa}</Text> : null}
    </View>
    <Switch
      value={giaTri}
      onValueChange={khiDoi}
      trackColor={{ false: '#E5E5E5', true: '#70B9BE' }}
      thumbColor="#fff"
    />
  </View>
);
