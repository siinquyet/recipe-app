import type { FC, ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NutBam } from './NutBam';

export const TrangDangTai: FC<{ thongDiep?: string }> = ({ thongDiep = 'Đang tải...' }) => (
  <View className="flex-1 items-center justify-center p-6">
    <ActivityIndicator size="large" color="#0A2533" />
    <Text className="mt-3 text-center text-sm text-neutral-500">{thongDiep}</Text>
  </View>
);

interface TrangTrongProps {
  tieuDe: string;
  moTa?: string;
  bieuTuong?: ReactNode;
}

export const TrangTrong: FC<TrangTrongProps> = ({ tieuDe, moTa, bieuTuong }) => (
  <View className="flex-1 items-center justify-center p-6">
    {bieuTuong}
    <Text className="mt-2 text-center text-base font-semibold text-neutral-900">{tieuDe}</Text>
    {moTa ? <Text className="mt-1 text-center text-sm text-neutral-500">{moTa}</Text> : null}
  </View>
);

interface TrangLoiProps {
  loi: string;
  khiThuLai?: () => void;
}

export const TrangLoi: FC<TrangLoiProps> = ({ loi, khiThuLai }) => (
  <View className="flex-1 items-center justify-center p-6">
    <Text className="text-center text-base font-semibold text-neutral-900">Đã có lỗi xảy ra</Text>
    <Text className="mt-1 text-center text-sm text-neutral-500">{loi}</Text>
    {khiThuLai ? <NutBam tieuDe="Thử lại" khiBam={khiThuLai} className="mt-4" /> : null}
  </View>
);
