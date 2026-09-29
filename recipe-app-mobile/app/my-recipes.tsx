import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { TheCongThuc } from '../src/components/recipe/TheCongThuc';
import { chuyenThanhDuLieuThe } from '../src/components/recipe/DanhSachCongThuc';
import { NutBam } from '../src/components/ui/NutBam';
import { TrangDangTai, TrangLoi, TrangTrong } from '../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../src/components/ui/VanBan';
import { useDanhSachCongThuc, useGuiDuyet } from '../src/hooks/useRecipes';
import { useAuthStore } from '../src/stores/authStore';

// BR-UREC: Lọc server-side theo tacGiaId, không tải thừa rồi lọc client
export default function ManHinhCongThucCuaToi() {
  const router = useRouter();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [trang, setTrang] = useState(0);
  const { data, isLoading, isFetching, isError, error, refetch } = useDanhSachCongThuc({
    page: trang,
    size: 50,
    ...(nguoiDung?.id ? { tacGiaId: nguoiDung.id } : {}),
  });
  const guiDuyet = useGuiDuyet();

  const cuaToi = data?.noiDung ?? [];

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
      ) : isError ? (
        <TrangLoi loi={(error as Error)?.message ?? 'Không tải được'} khiThuLai={() => refetch()} />
      ) : (
        <FlatList
          data={cuaToi}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <TrangTrong tieuDe="Chưa có công thức" moTa="Tạo món đầu tiên của bạn" />
          }
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />}
          renderItem={({ item }) => (
            <View className="mb-4">
              <TheCongThuc
                duLieu={chuyenThanhDuLieuThe(item)}
                khiBam={() => router.push(`/recipe/${item.id}`)}
              />
              <View className="mt-2 flex-row items-center justify-between">
                <BodyText>
                  Trạng thái: <CaptionText>{item.trangThai}</CaptionText>
                </BodyText>
                {item.trangThai === 'DRAFT' || item.trangThai === 'REJECTED' ? (
                  <NutBam
                    tieuDe={guiDuyet.isPending ? 'Đang gửi...' : 'Gửi duyệt'}
                    bienThe="vien"
                    dangTai={guiDuyet.isPending}
                    khiBam={() => guiDuyet.mutate(item.id)}
                    className="px-4 py-2"
                  />
                ) : null}
              </View>
            </View>
          )}
        />
      )}
      {!nguoiDung && !isLoading && (
        <Text className="px-4 pb-4 text-left text-sm text-neutral-500">
          Đăng nhập để xem công thức của bạn
        </Text>
      )}
    </SafeAreaView>
  );
}
