import type { FC, ReactNode } from 'react';
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
  bieuTuong?: ReactNode;
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
  bieuTuong,
}) => (
  <View className={className}>
    {nhan ? <Text className="mb-1 text-left text-sm font-medium text-neutral-700">{nhan}</Text> : null}
    <View className="relative justify-center">
      {bieuTuong ? <View className="absolute left-4 z-10">{bieuTuong}</View> : null}
      <TextInput
        value={giaTri}
        onChangeText={khiDoi}
        secureTextEntry={anChu}
        placeholder={goiY}
        keyboardType={banPhim}
        className={`rounded-xl border bg-white py-3 pr-4 text-left text-base text-neutral-900 ${
          bieuTuong ? 'pl-12' : 'px-4'
        } ${loi ? 'border-red-500' : 'border-neutral-300'}`}
      />
    </View>
    {loi ? <Text className="mt-1 text-left text-xs text-red-600">{loi}</Text> : null}
  </View>
);
