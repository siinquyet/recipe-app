import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { DanhSachCongThuc } from '../src/components/recipe/DanhSachCongThuc';
import { TrangDangTai } from '../src/components/ui/TrangThai';
import { TitleText } from '../src/components/ui/VanBan';
import { useDanhSachYeuThich } from '../src/hooks/useRecipes';

// BR-SOC: Danh sách yêu thích lấy từ GET /favorites của chính người dùng
export default function ManHinhYeuThich() {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, error, refetch } = useDanhSachYeuThich(0, 50);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A2E" />
        </Pressable>
        <TitleText className="text-xl">Công thức yêu thích</TitleText>
      </View>
      {isLoading ? (
        <TrangDangTai />
      ) : (
        <DanhSachCongThuc
          duLieu={data?.noiDung ?? []}
          dangTai={false}
          dangTaiThem={isFetching && !isLoading}
          loi={isError ? (error as Error)?.message : null}
          khiLamMoi={() => refetch()}
          khiChon={(id) => router.push(`/recipe/${id}`)}
        />
      )}
    </SafeAreaView>
  );
}
