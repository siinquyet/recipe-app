import { Link, type Href } from 'expo-router';
import { ArrowLeft, BookOpen, Phone, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText, CaptionText } from '../ui/VanBan';

interface KhungXacThucProps {
  nhanPill: string;
  BieuTuongPill?: LucideIcon;
  tieuDe: string;
  moTa: string;
  children: ReactNode;
  lienKetDuoi?: { nhan: string; duongDan: Href };
}

// BR-UI: Khung Editorial đồng bộ web (DESIGN.md) — logo, pill, tiêu đề, hỗ trợ
export function KhungXacThuc({ nhanPill, BieuTuongPill, tieuDe, moTa, children, lienKetDuoi }: KhungXacThucProps) {
  return (
    <SafeAreaView className="flex-1 bg-mist">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: 'center' }}>
        <View className="rounded-[2.5rem] bg-white p-6 shadow-sm">
          <View className="flex-col items-center">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-2xl bg-cream">
              <BookOpen size={36} color="#0A2533" />
            </View>
            <View className="mb-3 flex-row items-center gap-1.5 rounded-full bg-accent-light px-3 py-1">
              {BieuTuongPill ? <BieuTuongPill size={14} color="#0A2533" /> : null}
              <Text className="text-xs font-semibold uppercase tracking-widest text-primary">{nhanPill}</Text>
            </View>
            <Text className="text-center text-3xl font-black text-primary">{tieuDe}</Text>
            <BodyText canLe="giua" className="mt-2 text-sm text-neutral-500">{moTa}</BodyText>
          </View>
          <View className="mt-6">{children}</View>
          {lienKetDuoi ? (
            <Link href={lienKetDuoi.duongDan} asChild>
              <View className="mt-6 flex-row items-center justify-center gap-2">
                <ArrowLeft size={16} color="#0A2533" />
                <Text className="text-sm font-semibold text-primary">{lienKetDuoi.nhan}</Text>
              </View>
            </Link>
          ) : null}
          <View className="mt-4 items-center rounded-2xl bg-mist p-4">
            <CaptionText canLe="giua">
              Gặp khó khăn? Liên hệ <Text className="font-semibold text-primary">Đội ngũ hỗ trợ Bếp Nhà</Text>:
            </CaptionText>
            <View className="mt-1 flex-row items-center gap-2">
              <Phone size={14} color="#0A2533" />
              <Text className="text-sm font-semibold text-primary">1900 6868 • hotro@bepnha.vn</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
