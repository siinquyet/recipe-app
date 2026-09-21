import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronLeft, Moon, Palette, CalendarDays } from 'lucide-react-native';
import { OChuyenDoi } from '../src/components/ui/OChuyenDoi';
import { BodyText, CaptionText, TitleText } from '../src/components/ui/VanBan';
import { useUiStore } from '../src/stores/uiStore';

// S22/S23/S24: Cài đặt lưu cục bộ (uiStore) — notification chưa có API push
export default function ManHinhCaiDat() {
  const router = useRouter();
  const cheDoSangToi = useUiStore((s) => s.cheDoSangToi);
  const datCheDoSangToi = useUiStore((s) => s.datCheDoSangToi);
  const dinhDangNgay = useUiStore((s) => s.dinhDangNgay);
  const datDinhDangNgay = useUiStore((s) => s.datDinhDangNgay);

  return (
    <SafeAreaView className="flex-1 bg-mist">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2">
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1A1A2E" />
          </Pressable>
          <TitleText className="text-xl">Cài đặt</TitleText>
        </View>

        <View className="mt-4 rounded-2xl bg-white px-4 shadow-sm">
          <View className="flex-row items-center gap-3 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
              <Moon size={18} color="#0A2533" />
            </View>
            <View className="flex-1">
              <BodyText>Chế độ tối</BodyText>
              <CaptionText>Sáng / Tối / Theo hệ thống</CaptionText>
            </View>
          </View>
          <View className="flex-row gap-2 pb-4">
            {(
              [
                { giaTri: 'sang', nhan: 'Sáng' },
                { giaTri: 'toi', nhan: 'Tối' },
                { giaTri: 'he-thong', nhan: 'Hệ thống' },
              ] as const
            ).map((cheDo) => (
              <Pressable
                key={cheDo.giaTri}
                onPress={() => datCheDoSangToi(cheDo.giaTri)}
                className={`flex-1 items-center rounded-xl border px-3 py-2 ${
                  cheDoSangToi === cheDo.giaTri ? 'border-primary bg-accent-light' : 'border-neutral-300'
                }`}
              >
                <BodyText
                  className={
                    cheDoSangToi === cheDo.giaTri ? 'text-sm font-semibold text-primary' : 'text-sm text-neutral-700'
                  }
                >
                  {cheDo.nhan}
                </BodyText>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white px-4 shadow-sm">
          <View className="flex-row items-center gap-3 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
              <CalendarDays size={18} color="#0A2533" />
            </View>
            <View className="flex-1">
              <BodyText>Định dạng ngày</BodyText>
              <CaptionText>Áp dụng cho toàn bộ ứng dụng</CaptionText>
            </View>
          </View>
          <View className="flex-row gap-2 pb-4">
            {(
              [
                { giaTri: 'DD/MM/YYYY', nhan: 'DD/MM/YYYY' },
                { giaTri: 'MM/DD/YYYY', nhan: 'MM/DD/YYYY' },
                { giaTri: 'YYYY-MM-DD', nhan: 'YYYY-MM-DD' },
              ] as const
            ).map((dinhDang) => (
              <Pressable
                key={dinhDang.giaTri}
                onPress={() => datDinhDangNgay(dinhDang.giaTri)}
                className={`flex-1 items-center rounded-xl border px-2 py-2 ${
                  dinhDangNgay === dinhDang.giaTri ? 'border-primary bg-accent-light' : 'border-neutral-300'
                }`}
              >
                <BodyText
                  className={
                    dinhDangNgay === dinhDang.giaTri
                      ? 'text-xs font-semibold text-primary'
                      : 'text-xs text-neutral-700'
                  }
                >
                  {dinhDang.nhan}
                </BodyText>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-white px-4 shadow-sm">
          <View className="flex-row items-center gap-3 border-b border-neutral-100 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
              <Bell size={18} color="#0A2533" />
            </View>
            <BodyText className="flex-1">Thông báo</BodyText>
          </View>
          <OChuyenDoi
            nhan="Nhắc giờ nấu"
            moTa="Gợi ý món theo bữa chính trong ngày"
            giaTri={true}
            khiDoi={() => {}}
          />
          <OChuyenDoi
            nhan="Nhắc đi chợ cuối tuần"
            moTa="Tạo danh sách đi chợ từ kế hoạch ăn"
            giaTri={false}
            khiDoi={() => {}}
          />
        </View>

        <View className="mt-4 rounded-2xl bg-white px-4 shadow-sm">
          <View className="flex-row items-center gap-3 py-4">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-light">
              <Palette size={18} color="#0A2533" />
            </View>
            <View className="flex-1">
              <BodyText>Ngôn ngữ</BodyText>
              <CaptionText>Tiếng Việt</CaptionText>
            </View>
          </View>
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
