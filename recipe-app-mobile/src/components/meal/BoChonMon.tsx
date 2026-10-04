import type { FC } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Chip } from '../ui/Chip';
import { BodyText, CaptionText } from '../ui/VanBan';
import { CAC_BUOI_AN } from '../../lib/utils/lich-tuan';
import { congNgay, cuoiTuanNay, dauTuanNay, homNay, nhanThuNgan } from '../../lib/utils/lich-tuan';
import { dinhDangNgay } from '../../lib/utils/dinh-dang';

interface DaiNgayProps {
  ngayChon: string;
  khiChon: (ngay: string) => void;
  soNgay?: number;
  tuNgay?: string;
  nhan?: string;
}

// BR-MEAL: Dải ngày bấm ngang 14 ngày — khỏi gõ YYYY-MM-DD
export const DaiNgay: FC<DaiNgayProps> = ({ ngayChon, khiChon, soNgay = 14, tuNgay, nhan = 'Ngày ăn' }) => {
  const homNayStr = homNay();
  const moc = tuNgay && tuNgay.length > 0 ? tuNgay : homNayStr;
  const cacNgay = Array.from({ length: soNgay }, (_, i) => congNgay(moc, i));
  return (
    <View>
      <CaptionText className="font-semibold">{nhan}</CaptionText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
        <View className="flex-row gap-2">
          {cacNgay.map((ngay) => {
            const chon = ngay === ngayChon;
            const laHomNay = ngay === homNayStr;
            return (
              <Pressable
                key={ngay}
                accessibilityRole="button"
                onPress={() => khiChon(ngay)}
                className={`w-14 items-center rounded-2xl border px-1 py-2 ${
                  chon ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'
                }`}
              >
                <Text className={`text-[11px] font-semibold ${chon ? 'text-white' : 'text-neutral-500'}`}>
                  {laHomNay ? 'Hôm nay' : nhanThuNgan(ngay)}
                </Text>
                <Text className={`mt-0.5 text-sm font-bold ${chon ? 'text-white' : 'text-primary'}`}>
                  {dinhDangNgay(ngay).slice(0, 5)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

interface ChonBuoiAnProps {
  buoiChon: string;
  khiChon: (buoi: string) => void;
}

// BR-MEAL: Chọn buổi bằng chip — Sáng/Trưa/Tối/Phụ
export const ChonBuoiAn: FC<ChonBuoiAnProps> = ({ buoiChon, khiChon }) => (
  <View>
    <CaptionText className="font-semibold">Buổi ăn</CaptionText>
    <View className="mt-2 flex-row gap-2">
      {CAC_BUOI_AN.map((b) => (
        <Chip key={b.ma} nhan={b.nhan} chon={buoiChon === b.ma} khiBam={() => khiChon(b.ma)} />
      ))}
    </View>
  </View>
);

interface ChonKhoangNgayProps {
  tuNgay: string;
  denNgay: string;
  khiDoi: (tuNgay: string, denNgay: string) => void;
}

// BR-MEAL: Chọn khoảng bằng preset + dải bấm — khỏi gõ YYYY-MM-DD
export const ChonKhoangNgay: FC<ChonKhoangNgayProps> = ({ tuNgay, denNgay, khiDoi }) => {
  const datTuanNay = () => khiDoi(dauTuanNay(), cuoiTuanNay());
  const dat7NgayToi = () => khiDoi(homNay(), congNgay(homNay(), 6));
  return (
    <View>
      <View className="flex-row gap-2">
        <Chip nhan="Tuần này (T2–CN)" chon={false} khiBam={datTuanNay} />
        <Chip nhan="7 ngày tới" chon={false} khiBam={dat7NgayToi} />
      </View>
      <View className="mt-2">
        <DaiNgay nhan="Từ ngày" ngayChon={tuNgay} khiChon={(n) => khiDoi(n, denNgay < n ? n : denNgay)} soNgay={14} />
      </View>
      <View className="mt-2">
        <DaiNgay nhan="Đến ngày" ngayChon={denNgay} khiChon={(n) => khiDoi(tuNgay > n ? n : tuNgay, n)} soNgay={14} />
      </View>
      <CaptionText className="mt-1">
        {tuNgay && denNgay ? `Từ ${dinhDangNgay(tuNgay)} đến ${dinhDangNgay(denNgay)}` : 'Bấm chọn ngày bắt đầu và kết thúc'}
      </CaptionText>
    </View>
  );
};

interface TangGiamKhauPhanProps {
  khauPhan: number;
  khiDoi: (khauPhan: number) => void;
}

// BR-MEAL: Tăng giảm khẩu phần bằng nút — khỏi gõ số
export const TangGiamKhauPhan: FC<TangGiamKhauPhanProps> = ({ khauPhan, khiDoi }) => (
  <View>
    <CaptionText className="font-semibold">Khẩu phần</CaptionText>
    <View className="mt-2 flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Giảm khẩu phần"
        onPress={() => khiDoi(Math.max(1, khauPhan - 1))}
        className="h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white"
      >
        <Minus size={16} color="#0A2533" />
      </Pressable>
      <BodyText dam className="min-w-20 text-center text-lg">
        {khauPhan} người
      </BodyText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tăng khẩu phần"
        onPress={() => khiDoi(Math.min(20, khauPhan + 1))}
        className="h-10 w-10 items-center justify-center rounded-full bg-primary"
      >
        <Plus size={16} color="#fff" />
      </Pressable>
    </View>
  </View>
);
