import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Clock, Star, Users } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { NumberDisplay } from '../ui/NumberDisplay';

export interface DuLieuTheCongThuc {
  id: string;
  hinhAnh: string | null;
  tenMon: string;
  thoiGianNau: number;
  khauPhan: number;
  tacGia: string;
  tacGiaAvatar: string | null;
  diemDanhGia?: number;
  soLuotDanhGia?: number;
}

export type BienTheCard = 'compact' | 'large' | 'grid';

interface TheCongThucProps {
  duLieu: DuLieuTheCongThuc;
  khiBam?: () => void;
  bienThe?: BienTheCard;
  className?: string;
}

// BR-UI: Khung chờ kem + chữ cái accent y web, không dùng xám trơ
const HinhAnhMon: FC<{ uri: string | null; ten: string }> = ({ uri, ten }) => {
  if (!uri) {
    return (
      <View className="h-full w-full items-center justify-center bg-cream">
        <Text className="text-2xl font-bold text-accent-dark">{ten.trim().charAt(0).toUpperCase()}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />;
};

const NhanDanhGia: FC<{ diem: number }> = ({ diem }) => (
  <View className="flex-row items-center gap-1 rounded-lg bg-black/60 px-1.5 py-0.5">
    <Star size={12} color="#FFC107" fill="#FFC107" />
    <Text className="text-[11px] font-bold text-white">{diem.toFixed(1)}</Text>
  </View>
);

const ThongTinNgan: FC<{ duLieu: DuLieuTheCongThuc }> = ({ duLieu }) => (
  <View className="flex-row items-center gap-3">
    <View className="flex-row items-center gap-1">
      <Clock size={14} color="#97A2B0" />
      <NumberDisplay value={duLieu.thoiGianNau} unit="p" className="text-xs" />
    </View>
    <View className="flex-row items-center gap-1">
      <Users size={14} color="#97A2B0" />
      <NumberDisplay value={duLieu.khauPhan} unit="người" className="text-xs" />
    </View>
  </View>
);

const HangTacGia: FC<{ duLieu: DuLieuTheCongThuc }> = ({ duLieu }) => (
  <View className="flex-row items-center gap-1.5">
    <Avatar nguon={duLieu.tacGiaAvatar} ten={duLieu.tacGia} kichThuoc={16} />
    <Text className="flex-1 text-left text-xs text-neutral-500" numberOfLines={1}>
      {duLieu.tacGia}
    </Text>
  </View>
);

const TheCompact: FC<{ duLieu: DuLieuTheCongThuc; khiBam?: () => void }> = ({ duLieu, khiBam }) => (
  <Pressable
    accessibilityRole="button"
    onPress={khiBam}
    className="w-56 overflow-hidden rounded-3xl bg-white shadow-sm"
  >
    <View className="relative h-32 w-full">
      <HinhAnhMon uri={duLieu.hinhAnh} ten={duLieu.tenMon} />
      {(duLieu.diemDanhGia ?? 0) > 0 ? (
        <View className="absolute right-2 top-2">
          <NhanDanhGia diem={duLieu.diemDanhGia ?? 0} />
        </View>
      ) : null}
    </View>
    <View className="p-3">
      <Text className="text-left font-serif text-[15px] font-bold text-primary" numberOfLines={2}>
        {duLieu.tenMon}
      </Text>
      <View className="mt-2">
        <ThongTinNgan duLieu={duLieu} />
      </View>
    </View>
  </Pressable>
);

const TheLarge: FC<{ duLieu: DuLieuTheCongThuc; khiBam?: () => void }> = ({ duLieu, khiBam }) => (
  <Pressable
    accessibilityRole="button"
    onPress={khiBam}
    className="mx-4 my-2 h-28 flex-row overflow-hidden rounded-3xl bg-white shadow-sm"
  >
    <View className="h-full w-28">
      <HinhAnhMon uri={duLieu.hinhAnh} ten={duLieu.tenMon} />
    </View>
    <View className="flex-1 justify-between p-3">
      <View>
        <Text className="text-left font-serif text-base font-bold text-primary" numberOfLines={2}>
          {duLieu.tenMon}
        </Text>
        <View className="mt-1">
          <HangTacGia duLieu={duLieu} />
        </View>
      </View>
      <ThongTinNgan duLieu={duLieu} />
    </View>
  </Pressable>
);

const TheGrid: FC<{ duLieu: DuLieuTheCongThuc; khiBam?: () => void }> = ({ duLieu, khiBam }) => (
  <Pressable
    accessibilityRole="button"
    onPress={khiBam}
    className="overflow-hidden rounded-3xl bg-white shadow-sm"
  >
    <View className="relative h-36 w-full">
      <HinhAnhMon uri={duLieu.hinhAnh} ten={duLieu.tenMon} />
      {(duLieu.diemDanhGia ?? 0) > 0 ? (
        <View className="absolute right-2 top-2">
          <NhanDanhGia diem={duLieu.diemDanhGia ?? 0} />
        </View>
      ) : null}
    </View>
    <View className="p-2.5">
      <Text className="text-left font-serif text-sm font-bold text-primary" numberOfLines={2}>
        {duLieu.tenMon}
      </Text>
      <View className="mt-1.5">
        <ThongTinNgan duLieu={duLieu} />
      </View>
    </View>
  </Pressable>
);

export const TheCongThuc: FC<TheCongThucProps> = ({ duLieu, khiBam, bienThe = 'large', className = '' }) => (
  <View className={className}>
    {bienThe === 'compact' ? (
      <TheCompact duLieu={duLieu} khiBam={khiBam} />
    ) : bienThe === 'grid' ? (
      <TheGrid duLieu={duLieu} khiBam={khiBam} />
    ) : (
      <TheLarge duLieu={duLieu} khiBam={khiBam} />
    )}
  </View>
);
