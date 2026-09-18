import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { CookingPot, Flame, Heart, ShoppingCart, Sun, Timer } from 'lucide-react-native';
import { TheCongThuc } from '../../src/components/recipe/TheCongThuc';
import { chuyenThanhDuLieuThe } from '../../src/components/recipe/DanhSachCongThuc';
import type { CongThuc } from '../../src/types/api';
import { TrangDangTai } from '../../src/components/ui/TrangThai';
import { Chip } from '../../src/components/ui/Chip';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { useAuthStore } from '../../src/stores/authStore';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { useDanhSachCongThuc } from '../../src/hooks/useRecipes';

// Category theo SVG gốc: theo bữa ăn
const NHOM_MON = ['Tất cả', 'Sáng', 'Trưa', 'Tối', 'Đồ ăn nhẹ'] as const;

const HinhAnh: FC<{ ct: CongThuc }> = ({ ct }) =>
  ct.anhThumbnail ? (
    <Image source={{ uri: layUrlAnh(ct.anhThumbnail) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
  ) : (
    <View className="h-full w-full items-center justify-center bg-cream">
      <Text className="text-3xl font-bold text-accent">{ct.ten.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );

// Card phổ biến kiểu SVG: ảnh + nút tim + tên + Calories • Time
const ThePhoBien: FC<{ ct: CongThuc; khiBam: () => void }> = ({ ct, khiBam }) => (
  <View className="relative w-56">
    <Pressable accessibilityRole="button" onPress={khiBam} className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="relative h-36 w-full">
        <HinhAnh ct={ct} />
      </View>
      <View className="p-3">
        <Text className="text-left text-[15px] font-semibold text-primary" numberOfLines={2}>
          {ct.ten}
        </Text>
        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Flame size={13} color="#97A2B0" />
            <CaptionText>{ct.dinhDuong ? `${ct.dinhDuong.calo} Kcal` : '— Kcal'}</CaptionText>
          </View>
          <View className="h-3 w-px bg-neutral-300" />
          <View className="flex-row items-center gap-1">
            <Timer size={13} color="#97A2B0" />
            <CaptionText>{ct.thoiGianNauPhut} Min</CaptionText>
          </View>
        </View>
      </View>
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Yêu thích"
      className="absolute right-2.5 top-2.5 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/90"
    >
      <Heart size={16} color="#0A2533" />
    </Pressable>
  </View>
);

export default function ManHinhTrangChu() {
  const router = useRouter();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [nhomChon, setNhomChon] = useState(0);

  const noiBat = useDanhSachCongThuc({ page: 0, size: 5 });
  const phoBien = useDanhSachCongThuc({ page: 0, size: 6, sort: 'rating:desc' });

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F5]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-4 pt-4">
          <Sun size={22} color="#70B9BE" />
          <View className="flex-1">
            <TitleText className="text-xl">Chào buổi sáng</TitleText>
            <CaptionText>{nguoiDung?.tenHienThi ?? 'Bạn'}</CaptionText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Giỏ đi chợ"
            onPress={() => router.push('/(tabs)/shopping')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ShoppingCart size={18} color="#0A2533" />
          </Pressable>
        </View>

        <View className="mt-4 px-4">
          <SectionHeader tieuDe="Danh mục" khiXemTatCa={() => router.push('/(tabs)/search')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2 pb-1">
              {NHOM_MON.map((nhom, i) => (
                <Chip key={nhom} nhan={nhom} chon={nhomChon === i} khiBam={() => setNhomChon(i)} />
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mt-5">
          <View className="px-4">
            <SectionHeader tieuDe="Nổi bật" khiXemTatCa={() => router.push('/(tabs)/search')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 pl-4">
            {noiBat.isLoading ? (
              <View className="w-56">
                <TrangDangTai />
              </View>
            ) : (
              <View className="flex-row gap-3 pb-1">
                {(noiBat.data?.noiDung ?? []).map((ct) => (
                  <TheCongThuc
                    key={ct.id}
                    duLieu={chuyenThanhDuLieuThe(ct)}
                    bienThe="compact"
                    khiBam={() => router.push(`/recipe/${ct.id}`)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        <View className="mt-6">
          <View className="px-4">
            <SectionHeader tieuDe="Công thức phổ biến" khiXemTatCa={() => router.push('/(tabs)/search')} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 pl-4">
            {phoBien.isLoading ? (
              <View className="w-56">
                <TrangDangTai />
              </View>
            ) : (
              <View className="flex-row gap-3 pb-1">
                {(phoBien.data?.noiDung ?? []).map((ct) => (
                  <ThePhoBien key={ct.id} ct={ct} khiBam={() => router.push(`/recipe/${ct.id}`)} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
        <View className="h-24" />
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tạo công thức"
        onPress={() => router.push('/recipe/create')}
        className="absolute bottom-6 right-4 z-10 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg"
      >
        <CookingPot size={26} color="#C6E3E5" />
      </Pressable>
    </SafeAreaView>
  );
}
