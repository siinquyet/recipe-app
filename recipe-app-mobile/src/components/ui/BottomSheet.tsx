import type { FC, ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

interface BottomSheetProps {
  hienThi: boolean;
  tieuDe: string;
  khiDong: () => void;
  children: ReactNode;
}

// BR-UI: Bottom sheet dùng chung cho filter, thêm vào kế hoạch
export const BottomSheet: FC<BottomSheetProps> = ({ hienThi, tieuDe, khiDong, children }) => (
  <Modal visible={hienThi} transparent animationType="slide" onRequestClose={khiDong}>
    <Pressable className="flex-1 justify-end bg-black/40" onPress={khiDong}>
      <Pressable className="rounded-t-3xl bg-white px-4 pb-8 pt-2">
        <View className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300" />
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-neutral-900">{tieuDe}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={khiDong} className="p-1">
            <X size={20} color="#737373" />
          </Pressable>
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);
