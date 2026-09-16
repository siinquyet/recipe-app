import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChevronRight,
  Heart,
  LogOut,
  Settings,
  ShoppingCart,
  UtensilsCrossed,
} from 'lucide-react-native';
import { Avatar } from '../../src/components/ui/Avatar';
import { TrangDangTai, TrangLoi } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { useHoSoNguoiDung } from '../../src/hooks/useAuth';
import { useAuthStore } from '../../src/stores/authStore';

interface MucHoSo {
  nhan: string;
  Icon: typeof Heart;
  den: string;
}

const MUC_NHANH: MucHoSo[] = [
  { nhan: 'Công thức của tôi', Icon: UtensilsCrossed, den: '/my-recipes' },
  { nhan: 'Yêu thích', Icon: Heart, den: '/favorites' },
  { nhan: 'Kế hoạch ăn', Icon: CalendarDays, den: '/(tabs)/mealplan' },
  { nhan: 'Danh sách đi chợ', Icon: ShoppingCart, den: '/(tabs)/shopping' },
];

const MUC_TAI_KHOAN: MucHoSo[] = [{ nhan: 'Cài đặt', Icon: Settings, den: '/settings' }];

function HangHoSo({ muc, khiBam }: { muc: MucHoSo; khiBam: () => void }) {
  const Icon = muc.Icon;
  return (
    <Pressable accessibilityRole="button" onPress={khiBam} className="flex-row items-center gap-3 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
        <Icon size={18} color="#0A2533" />
      </View>
      <BodyText className="flex-1">{muc.nhan}</BodyText>
      <ChevronRight size={18} color="#97A2B0" />
    </Pressable>
  );
}

export default function ManHinhHoSo() {
  const router = useRouter();
  const daDangNhap = useAuthStore((s) => s.daDangNhap);
  const dangXuat = useAuthStore((s) => s.dangXuat);
  const { data, isLoading, isError, refetch } = useHoSoNguoiDung(daDangNhap);

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F5]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-4 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Giỏ đi chợ"
            onPress={() => router.push('/(tabs)/shopping')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ShoppingCart size={18} color="#0A2533" />
          </Pressable>
          <View className="flex-1" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cài đặt"
            onPress={() => router.push('/settings')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Settings size={18} color="#0A2533" />
          </Pressable>
        </View>

        <View className="px-4 pt-2">
          {isLoading ? (
            <TrangDangTai />
          ) : isError || !data ? (
            <TrangLoi loi="Không tải được hồ sơ" khiThuLai={() => refetch()} />
          ) : (
            <View className="mt-4 flex-row items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <Avatar nguon={data.anhDaiDien} ten={data.tenHienThi} kichThuoc={72} />
              <View className="flex-1">
                <TitleText className="text-lg">{data.tenHienThi}</TitleText>
                <CaptionText>Nhà phát triển công thức</CaptionText>
                <CaptionText>{data.email}</CaptionText>
              </View>
              <ChevronRight size={18} color="#97A2B0" />
            </View>
          )}
        </View>

        <View className="mt-4 px-4">
          <View className="rounded-2xl bg-white px-4 shadow-sm">
            {MUC_NHANH.map((muc) => (
              <HangHoSo key={muc.nhan} muc={muc} khiBam={() => router.push(muc.den as never)} />
            ))}
          </View>
        </View>

        <View className="mt-4 px-4 pb-8">
          <View className="rounded-2xl bg-white px-4 shadow-sm">
            <HangHoSo muc={MUC_TAI_KHOAN[0]} khiBam={() => router.push('/settings')} />
            <Pressable
              accessibilityRole="button"
              onPress={async () => {
                await dangXuat();
                router.replace('/(auth)/login');
              }}
              className="flex-row items-center gap-3 py-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                <LogOut size={18} color="#C62828" />
              </View>
              <BodyText className="flex-1 text-danger">Đăng xuất</BodyText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

