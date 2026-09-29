import { useRouter } from 'expo-router';
import type { FC } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowRight,
  BookMarked,
  ChefHat,
  CookingPot,
  Flame,
  Heart,
  Search,
  ShoppingCart,
  Sun,
  Timer,
} from 'lucide-react-native';
import { TheCongThuc } from '../../src/components/recipe/TheCongThuc';
import { chuyenThanhDuLieuThe } from '../../src/components/recipe/DanhSachCongThuc';
import type { CongThuc } from '../../src/types/api';
import { TrangDangTai } from '../../src/components/ui/TrangThai';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { MAU_SAC } from '../../src/constants/cau-hinh';
import { useAuthStore } from '../../src/stores/authStore';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { useDanhSachCongThuc, useChuyenDoiYeuThich, useDanhSachYeuThich } from '../../src/hooks/useRecipes';

// Category theo SVG gốc: theo bữa ăn
const NHOM_MON = ['Tất cả', 'Sáng', 'Trưa', 'Tối', 'Đồ ăn nhẹ'] as const;

// BR-UI: Nhóm món lọc theo từ khóa tên món (backend chưa có trường buổi ăn riêng)
const TU_KHOA_NHOM: Record<(typeof NHOM_MON)[number], string | undefined> = {
  'Tất cả': undefined,
  Sáng: 'sáng',
  Trưa: 'trưa',
  Tối: 'tối',
  'Đồ ăn nhẹ': 'nhẹ',
};

// BR-UI: Từ khóa nhanh đồng bộ web Bếp Nhà — bấm để sang màn tìm kiếm kèm từ khóa
const TU_KHOA_NHANH = ['Thịt kho tàu', 'Canh cua mồng tơi', 'Bún thang', 'Gà om nấm'] as const;

// BR-UI: Lời chào theo giờ trong ngày, đồng bộ hero web "Chào buổi sáng, ..."
function layLoiChao(gio: number): string {
  if (gio >= 5 && gio < 11) return 'Chào buổi sáng';
  if (gio >= 11 && gio < 14) return 'Chào buổi trưa';
  if (gio >= 14 && gio < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

const HinhAnh: FC<{ ct: CongThuc }> = ({ ct }) =>
  ct.anhThumbnail ? (
    <Image source={{ uri: layUrlAnh(ct.anhThumbnail) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
  ) : (
    <View className="h-full w-full bg-mist" />
  );

// Card phổ biến kiểu SVG: ảnh + nút tim + tên + Calories • Time
const ThePhoBien: FC<{ ct: CongThuc; khiBam: () => void; daThich: boolean; khiThich: () => void }> = ({
  ct,
  khiBam,
  daThich,
  khiThich,
}) => (
  <View className="relative w-56">
    <Pressable accessibilityRole="button" onPress={khiBam} className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <View className="relative h-36 w-full">
        <HinhAnh ct={ct} />
      </View>
      <View className="p-3">
        <Text className="text-left font-serif text-[15px] font-bold text-primary" numberOfLines={2}>
          {ct.ten}
        </Text>
        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Flame size={13} color={MAU_SAC.MUTED} />
            <CaptionText>{ct.dinhDuong ? `${ct.dinhDuong.calo} Kcal` : '— Kcal'}</CaptionText>
          </View>
          <View className="h-3 w-px bg-neutral-300" />
          <View className="flex-row items-center gap-1">
            <Timer size={13} color={MAU_SAC.MUTED} />
            <CaptionText>{ct.thoiGianNauPhut} Min</CaptionText>
          </View>
        </View>
      </View>
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Yêu thích"
      onPress={khiThich}
      className="absolute right-2.5 top-2.5 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/90"
    >
      <Heart size={16} color={daThich ? '#CA4844' : MAU_SAC.MUC} fill={daThich ? '#CA4844' : 'transparent'} />
    </Pressable>
  </View>
);

// BR-SOC: Mỗi thẻ phổ biến tự quản lý toggle tim, đồng bộ server qua hook
const ThePhoBienCoTim: FC<{ ct: CongThuc; daThich: boolean; khiBam: () => void }> = ({ ct, daThich, khiBam }) => {
  const chuyenThich = useChuyenDoiYeuThich(ct.id, daThich);
  return <ThePhoBien ct={ct} khiBam={khiBam} daThich={daThich} khiThich={() => chuyenThich.mutate(undefined)} />;
};

export default function ManHinhTrangChu() {
  const router = useRouter();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [nhomChon, setNhomChon] = useState(0);
  const tuKhoaNhom = TU_KHOA_NHOM[NHOM_MON[nhomChon]];

  const noiBat = useDanhSachCongThuc({ page: 0, size: 5, ...(tuKhoaNhom ? { search: tuKhoaNhom } : {}) });
  const phoBien = useDanhSachCongThuc({
    page: 0,
    size: 6,
    sort: 'rating:desc',
    ...(tuKhoaNhom ? { search: tuKhoaNhom } : {}),
  });
  const yeuThich = useDanhSachYeuThich(0, 100);
  const cuaToi = useDanhSachCongThuc({
    page: 0,
    size: 1,
    ...(nguoiDung?.id ? { tacGiaId: nguoiDung.id } : {}),
  });

  // BR-UI: Rail hiển thị phần còn lại sau món đầu danh sách nổi bật
  const danhSachRail = (noiBat.data?.noiDung ?? []).slice(1);

  const denTimKiem = (tuKhoa?: string) =>
    tuKhoa
      ? router.push({ pathname: '/(tabs)/search', params: { tuKhoa } })
      : router.push('/(tabs)/search');

  return (
    <SafeAreaView className="flex-1 bg-mist">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-4 pt-4">
          <Sun size={22} color={MAU_SAC.TEAL} />
          <View className="flex-1">
            <TitleText className="text-xl">
              {layLoiChao(new Date().getHours())}, {nguoiDung?.tenHienThi ?? 'Bạn'}
            </TitleText>
            <CaptionText>Hôm nay nấu món gì ấm cúng cho gia đình?</CaptionText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Giỏ đi chợ"
            onPress={() => router.push('/(tabs)/shopping')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ShoppingCart size={18} color={MAU_SAC.MUC} />
          </Pressable>
        </View>

        <View className="mt-4 px-4">
          <View className="flex-row items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2">
            <Search size={18} color={MAU_SAC.MUTED} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tìm kiếm món ăn"
              onPress={() => denTimKiem()}
              className="flex-1 py-1.5"
            >
              <Text className="text-left text-base text-neutral-400">Tìm món ăn, nguyên liệu...</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tìm kiếm"
              onPress={() => denTimKiem()}
              className="rounded-xl bg-primary px-4 py-2"
            >
              <Text className="text-sm font-semibold text-white">Tìm kiếm</Text>
            </Pressable>
          </View>
          <View className="mt-2.5 flex-row flex-wrap items-center gap-2">
            <CaptionText>Tìm nhanh:</CaptionText>
            {TU_KHOA_NHANH.map((tu) => (
              <Pressable
                key={tu}
                accessibilityRole="button"
                onPress={() => denTimKiem(tu)}
                className="rounded-full bg-white px-3 py-1.5 shadow-sm"
              >
                <Text className="text-left text-xs font-semibold text-deepteal">{tu}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {nguoiDung ? (
          <View className="mt-4 flex-row gap-3 px-4">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/favorites')}
              className="flex-1 flex-row items-center gap-3 rounded-3xl bg-white p-4 shadow-sm"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-light">
                <BookMarked size={19} color={MAU_SAC.MUC} />
              </View>
              <View className="flex-1">
                <NumberDisplay value={yeuThich.data?.tongSoPhanTu ?? 0} className="text-lg font-bold" />
                <CaptionText>Món đã lưu</CaptionText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/my-recipes')}
              className="flex-1 flex-row items-center gap-3 rounded-3xl bg-white p-4 shadow-sm"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-cream">
                <ChefHat size={19} color={MAU_SAC.MUC} />
              </View>
              <View className="flex-1">
                <NumberDisplay value={cuaToi.data?.tongSoPhanTu ?? 0} className="text-lg font-bold" />
                <CaptionText>Của tôi</CaptionText>
              </View>
            </Pressable>
          </View>
        ) : null}

        <View className="mt-5 px-4">
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
                {danhSachRail.map((ct) => (
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
          <View className="flex-row items-center justify-between px-4">
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
                  <ThePhoBienCoTim
                    key={ct.id}
                    ct={ct}
                    daThich={(yeuThich.data?.noiDung ?? []).some((luu) => luu.id === ct.id)}
                    khiBam={() => router.push(`/recipe/${ct.id}`)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        {nguoiDung ? (
          <View className="mt-6 px-4">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/(tabs)/mealplan')}
              className="flex-row items-center gap-3 rounded-2xl bg-primary p-4"
            >
              <View className="flex-1">
                <Text className="text-left text-base font-semibold text-white">Lên kế hoạch tuần mới</Text>
                <Text className="mt-0.5 text-left text-xs text-white/70">
                  Thực đơn cân bằng + tự tạo danh sách đi chợ
                </Text>
              </View>
              <ArrowRight size={20} color="#fff" />
            </Pressable>
          </View>
        ) : null}
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
