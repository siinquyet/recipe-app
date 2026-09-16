import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { BookOpen, CalendarDays, ShoppingBasket } from 'lucide-react-native';
import { layDatabase } from '../../src/lib/db/database';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NutBam } from '../../src/components/ui/NutBam';

const TRANG_ONBOARDING = [
  {
    bieuTuong: BookOpen,
    tieuDe: 'Khám phá công thức',
    moTa: 'Hàng ngàn món ăn từ cộng đồng và Spoonacular, dễ tìm theo nguyên liệu bạn có.',
  },
  {
    bieuTuong: CalendarDays,
    tieuDe: 'Lên kế hoạch cả tuần',
    moTa: 'Chọn món cho từng bữa, tự quy đổi nguyên liệu theo khẩu phần ăn.',
  },
  {
    bieuTuong: ShoppingBasket,
    tieuDe: 'Đi chợ thông minh',
    moTa: 'Từ kế hoạch ăn thành danh sách đi chợ, gạch từng món đã mua.',
  },
] as const;

async function datDaXemBatDau(): Promise<void> {
  const db = layDatabase();
  await db.runAsync('INSERT OR REPLACE INTO co_bat_dau (khoa, giaTri) VALUES (?, ?)', [
    'onboarding',
    '1',
  ]);
}

export default function ManHinhBatDau() {
  const router = useRouter();
  const [trang, setTrang] = useState(0);
  const dsRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    dsRef.current?.scrollToIndex({ index: trang, animated: true });
  }, [trang]);

  const sangTrangCuoi = trang >= TRANG_ONBOARDING.length - 1;

  const ketThuc = () => {
    datDaXemBatDau()
      .catch(() => {})
      .finally(() => router.replace('/(auth)/login'));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          ref={dsRef}
          data={TRANG_ONBOARDING.map((_, i) => i)}
          keyExtractor={(i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          renderItem={({ index }) => {
            const noiDung = TRANG_ONBOARDING[index];
            const Icon = noiDung.bieuTuong;
            return (
              <View className="flex-1 items-center justify-center px-8" style={{ width: '100%' }}>
              <View className="h-28 w-28 items-center justify-center rounded-full bg-cream">
                <Icon size={48} color="#0A2533" />
                </View>
                <TitleText className="mt-8 text-center text-2xl">{noiDung.tieuDe}</TitleText>
                <BodyText className="mt-3 text-center text-neutral-500">{noiDung.moTa}</BodyText>
              </View>
            );
          }}
          onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const viTri = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
            setTrang(Math.min(Math.max(viTri, 0), TRANG_ONBOARDING.length - 1));
          }}
        />

        <View className="flex-row justify-center gap-2 px-8">
          <View className="mx-auto mb-2 h-1 w-8 rounded-full bg-accent" />
          {TRANG_ONBOARDING.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === trang ? 'w-6 bg-primary' : 'w-2 bg-neutral-300'}`}
            />
          ))}
        </View>

        <View className="px-6 pb-6 pt-8">
          <NutBam
            tieuDe={sangTrangCuoi ? 'Bắt đầu nấu ăn' : 'Tiếp tục'}
            khiBam={() => (sangTrangCuoi ? ketThuc() : setTrang((t) => t + 1))}
          />
          <Pressable accessibilityRole="button" onPress={ketThuc} className="mt-4 items-center py-2">
            <CaptionText className="text-sm">Bỏ qua</CaptionText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
