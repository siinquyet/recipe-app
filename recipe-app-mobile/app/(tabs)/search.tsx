import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { DanhSachCongThuc } from '../../src/components/recipe/DanhSachCongThuc';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { CaptionText } from '../../src/components/ui/VanBan';
import { useDanhSachCongThuc } from '../../src/hooks/useRecipes';
import type { ThamSoDanhSachCongThuc } from '../../src/lib/api/recipes';
import { useDebounce } from '../../src/hooks/useDebounce';
import { boNhoCongThuc } from '../../src/lib/db/recipeRepository';

const KIEU_AN = ['Chay', 'Vegan', 'Keto', 'Không gluten'] as const;
const DO_KHO = ['Dễ', 'Trung bình', 'Khó'] as const;
const THOI_GIAN = ['< 15 phút', '< 30 phút', '< 60 phút', 'Bất kỳ'] as const;

export default function ManHinhTimKiem() {
  const router = useRouter();
  // BR-UI: Nhận từ khóa nhanh từ trang chủ (params.tuKhoa) để điền sẵn ô tìm kiếm
  const thamSoDieuHuong = useLocalSearchParams<{ tuKhoa?: string | string[] }>();
  const tuKhoaDieuHuong = Array.isArray(thamSoDieuHuong.tuKhoa)
    ? (thamSoDieuHuong.tuKhoa[0] ?? '')
    : (thamSoDieuHuong.tuKhoa ?? '');
  const [tuKhoa, setTuKhoa] = useState(tuKhoaDieuHuong);
  const [lichSu, setLichSu] = useState<string[]>([]);
  const [moFilter, setMoFilter] = useState(false);
  const [kieuAnChon, setKieuAnChon] = useState<string | null>(null);
  const [thoiGianChon, setThoiGianChon] = useState<number | null>(null);
  const tuKhoaTre = useDebounce(tuKhoa.trim(), 400);

  const thamSo: ThamSoDanhSachCongThuc = {
    page: 0,
    ...(tuKhoaTre.length > 0 ? { search: tuKhoaTre } : {}),
    ...(kieuAnChon ? { diet: kieuAnChon } : {}),
    ...(thoiGianChon ? { maxCookTime: thoiGianChon } : {}),
  };
  const { data, isLoading, isFetching, isError, error, refetch } = useDanhSachCongThuc(thamSo);

  const soFilterDangBat = (kieuAnChon ? 1 : 0) + (thoiGianChon ? 1 : 0);

  useEffect(() => {
    boNhoCongThuc.layTuKhoa().then(setLichSu).catch(() => {});
  }, []);

  // BR-UI: Đồng bộ khi trang chủ đẩy từ khóa nhanh sang (params đổi → điền lại ô tìm kiếm)
  useEffect(() => {
    if (tuKhoaDieuHuong.length > 0) setTuKhoa(tuKhoaDieuHuong);
  }, [tuKhoaDieuHuong]);

  useEffect(() => {
    if (tuKhoaTre.length === 0) {
      boNhoCongThuc.layTuKhoa().then(setLichSu).catch(() => {});
      return;
    }
    const henGio = setTimeout(() => {
      boNhoCongThuc
        .luuTuKhoa(tuKhoaTre)
        .then(() => boNhoCongThuc.layTuKhoa())
        .then(setLichSu)
        .catch(() => {});
    }, 800);
    return () => clearTimeout(henGio);
  }, [tuKhoaTre]);

  const xoaHetFilter = () => {
    setKieuAnChon(null);
    setThoiGianChon(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-mist">
      <View className="px-4 pb-2 pt-4">
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <ONhapLieu giaTri={tuKhoa} khiDoi={setTuKhoa} goiY="Tìm món ăn, nguyên liệu..." />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bộ lọc"
            onPress={() => setMoFilter(true)}
            className="relative h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white"
          >
            <SlidersHorizontal size={20} color="#0A2533" />
            {soFilterDangBat > 0 ? (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Text className="text-[10px] font-bold text-white">{soFilterDangBat}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {tuKhoaTre.length === 0 && lichSu.length > 0 ? (
          <View className="mt-3">
            <CaptionText>Tìm gần đây</CaptionText>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {lichSu.map((tu) => (
                <Pressable
                  key={tu}
                  onPress={() => setTuKhoa(tu)}
                  className="flex-row items-center gap-1 rounded-full bg-neutral-200 px-3 py-1.5"
                >
                  <Text className="text-left text-sm text-neutral-800">{tu}</Text>
                  <X size={12} color="#737373" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <DanhSachCongThuc
        duLieu={data?.noiDung ?? []}
        dangTai={isLoading}
        dangTaiThem={isFetching && !isLoading}
        loi={isError ? (error as Error)?.message : null}
        khiLamMoi={() => refetch()}
        khiChon={(id) => router.push(`/recipe/${id}`)}
        bienThe="grid"
        cot={2}
      />

      <BottomSheet hienThi={moFilter} tieuDe="Bộ lọc tìm kiếm" khiDong={() => setMoFilter(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CaptionText className="mt-4">Kiểu ăn</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {KIEU_AN.map((kieu) => (
              <Chip
                key={kieu}
                nhan={kieu}
                chon={kieuAnChon === kieu}
                khiBam={() => setKieuAnChon((t) => (t === kieu ? null : kieu))}
              />
            ))}
          </View>

          <CaptionText className="mt-5">Thời gian nấu</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {THOI_GIAN.map((nhan, i) => {
              const giaTri = [15, 30, 60, null][i];
              return (
                <Chip
                  key={nhan}
                  nhan={nhan}
                  chon={thoiGianChon === giaTri}
                  khiBam={() => setThoiGianChon(giaTri)}
                />
              );
            })}
          </View>

          <CaptionText className="mt-5">Độ khó</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {DO_KHO.map((doKho) => (
              <Chip key={doKho} nhan={doKho} />
            ))}
          </View>

          <View className="mt-6 flex-row gap-3 pb-2">
            <NutBam tieuDe="Xóa hết" bienThe="phu" khiBam={xoaHetFilter} className="flex-1" />
            <NutBam
              tieuDe="Áp dụng"
              khiBam={() => setMoFilter(false)}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
