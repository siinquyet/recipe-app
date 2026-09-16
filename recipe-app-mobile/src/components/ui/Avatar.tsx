import type { FC } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

interface AvatarProps {
  nguon?: string | null;
  ten?: string;
  kichThuoc?: number;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ nguon, ten = '', kichThuoc = 40, className = '' }) => {
  if (!nguon) {
    const chuCai = ten.trim().charAt(0).toUpperCase() || '?';
    return (
      <View
        style={{ width: kichThuoc, height: kichThuoc, borderRadius: kichThuoc / 2 }}
        className={`items-center justify-center bg-accent-light ${className}`}
      >
        <Text className="font-semibold text-primary">{chuCai}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: nguon }}
      style={{ width: kichThuoc, height: kichThuoc, borderRadius: kichThuoc / 2 }}
      contentFit="cover"
      className={className}
    />
  );
};
