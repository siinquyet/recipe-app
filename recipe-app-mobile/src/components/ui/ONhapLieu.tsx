import type { FC } from 'react';
import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

interface ONhapLieuProps {
  nhan?: string;
  loi?: string;
  giaTri: string;
  khiDoi: (giaTri: string) => void;
  anChu?: boolean;
  goiY?: string;
  banPhim?: KeyboardTypeOptions;
  className?: string;
}

export const ONhapLieu: FC<ONhapLieuProps> = ({
  nhan,
  loi,
  giaTri,
  khiDoi,
  anChu = false,
  goiY,
  banPhim = 'default',
  className = '',
}) => (
  <View className={className}>
    {nhan ? <Text className="mb-1 text-left text-sm font-medium text-neutral-700">{nhan}</Text> : null}
    <TextInput
      value={giaTri}
      onChangeText={khiDoi}
      secureTextEntry={anChu}
      placeholder={goiY}
      keyboardType={banPhim}
      className={`rounded-xl border bg-white px-4 py-3 text-left text-base text-neutral-900 ${
        loi ? 'border-red-500' : 'border-neutral-300'
      }`}
    />
    {loi ? <Text className="mt-1 text-left text-xs text-red-600">{loi}</Text> : null}
  </View>
);
