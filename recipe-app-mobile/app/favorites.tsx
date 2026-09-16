import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { TrangTrong } from '../src/components/ui/TrangThai';
import { TitleText } from '../src/components/ui/VanBan';

// S17: Backend chưa có GET danh sách yêu thích — UI khung empty state
export default function ManHinhYeuThich() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A2E" />
        </Pressable>
        <TitleText className="text-xl">Công thức yêu thích</TitleText>
      </View>
      <TrangTrong
        tieuDe="Chưa có món yêu thích"
        moTa="Nhấn tim trên công thức để lưu vào đây"
        bieuTuong={<Heart size={48} color="#D4D4D4" />}
      />
    </SafeAreaView>
  );
}
