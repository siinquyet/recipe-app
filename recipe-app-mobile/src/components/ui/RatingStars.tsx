import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

interface RatingStarsProps {
  diem: number;
  khiChon?: (diem: number) => void;
  kichThuoc?: number;
  className?: string;
}

// BR-UI: Hiển thị/chọn số sao đánh giá
export const RatingStars: FC<RatingStarsProps> = ({ diem, khiChon, kichThuoc = 28, className = '' }) => (
  <View className={`flex-row items-center gap-1 ${className}`}>
    {[1, 2, 3, 4, 5].map((sao) =>
      khiChon ? (
        <Pressable key={sao} onPress={() => khiChon(sao)} accessibilityRole="button">
          <Star
            size={kichThuoc}
            color={sao <= diem ? '#F59E0B' : '#D4D4D4'}
            fill={sao <= diem ? '#F59E0B' : 'transparent'}
          />
        </Pressable>
      ) : (
        <Star
          key={sao}
          size={kichThuoc}
          color={sao <= diem ? '#F59E0B' : '#D4D4D4'}
          fill={sao <= diem ? '#F59E0B' : 'transparent'}
        />
      ),
    )}
  </View>
);
