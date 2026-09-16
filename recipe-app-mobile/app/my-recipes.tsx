import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { DanhSachCongThuc } from '../src/components/recipe/DanhSachCongThuc';
import { TrangDangTai } from '../src/components/ui/TrangThai';
import { TitleText } from '../src/components/ui/VanBan';
import { useDanhSachCongThuc } from '../src/hooks/useRecipes';
import { useAuthStore } from '../src/stores/authStore';

// S13: Backend chưa có endpoint "my-recipes" — lọc client-side theo tác giả
export default function ManHinhCongThucCuaToi() {
  const router = useRouter();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [trang, setTrang] = useState(0);
  const { data, isLoading, isFetching, isError, error, refetch } = useDanhSachCongThuc({ page: trang, size: 50 });

  const cuaToi = (data?.noiDung ?? []).filter((ct) => ct.tacGia.id === nguoiDung?.id);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A2E" />
        </Pressable>
        <TitleText className="text-xl">Công thức của tôi</TitleText>
      </View>

      {isLoading ? (
        <TrangDangTai />
      ) : (
        <DanhSachCongThuc
          duLieu={cuaToi}
          dangTai={false}
          dangTaiThem={isFetching && !isLoading}
          loi={isError ? (error as Error)?.message : null}
          khiLamMoi={() => {
            setTrang(0);
            refetch();
          }}
          khiChon={(id) => router.push(`/recipe/${id}`)}
        />
      )}
    </SafeAreaView>
  );
}
