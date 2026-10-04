import { useState, type FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { DON_VI_CHUAN, MOC_DINH_LUONG, mocChoGiaTri } from '@cook/shared';
import { BodyText } from './VanBan';

interface DinhLuongProps {
  giaTri: number;
  khiDoi: (giaTri: number) => void;
  donVi: string;
  khiDoiDonVi: (donVi: string) => void;
}

// BR-03: Chọn mốc rồi kéo thanh, đơn vị chọn từ chips dùng chung
export const DinhLuong: FC<DinhLuongProps> = ({ giaTri, khiDoi, donVi, khiDoiDonVi }) => {
  // BR-03: Nhớ mốc đang kéo, khỏi suy ngược từ giá trị (giá trị biên 1/10/100 thuộc 2 mốc)
  const [mocIdx, setMocIdx] = useState(() => mocChoGiaTri(giaTri));
  const moc = MOC_DINH_LUONG[mocIdx] ?? MOC_DINH_LUONG[1];
  const chonMoc = (i: number) => {
    setMocIdx(i);
    khiDoi(MOC_DINH_LUONG[i].min);
  };
  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap gap-1.5">
        {MOC_DINH_LUONG.map((m, i) => {
          const chon = i === mocIdx;
          return (
            <Pressable
              key={m.nhan}
              accessibilityRole="button"
              onPress={() => chonMoc(i)}
              className={`rounded-full px-2.5 py-1 ${chon ? 'bg-primary' : 'bg-white'}`}
            >
              <Text className={`text-xs ${chon ? 'font-semibold text-white' : 'text-neutral-600'}`}>{m.nhan}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Slider
            minimumValue={moc.min}
            maximumValue={moc.max}
            step={moc.buoc}
            value={Math.min(Math.max(giaTri, moc.min), moc.max)}
            onValueChange={khiDoi}
            accessibilityLabel="Định lượng"
          />
        </View>
        <BodyText dam>{String(giaTri)}</BodyText>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {DON_VI_CHUAN.map((dv) => (
          <Pressable
            key={dv}
            accessibilityRole="button"
            onPress={() => khiDoiDonVi(dv)}
            className={`rounded-full px-2.5 py-1 ${donVi === dv ? 'bg-primary' : 'bg-white'}`}
          >
            <Text className={`text-xs ${donVi === dv ? 'font-semibold text-white' : 'text-neutral-600'}`}>{dv}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
