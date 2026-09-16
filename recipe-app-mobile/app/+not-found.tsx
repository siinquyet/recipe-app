import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy' }} />
      <View className="flex-1 items-center justify-center bg-white p-5">
        <Text className="text-left text-xl font-bold text-neutral-900">Trang này không tồn tại.</Text>
        <Link href="/(tabs)" className="mt-4 py-2">
          <Text className="text-left text-sm text-accent-dark">Về trang chủ</Text>
        </Link>
      </View>
    </>
  );
}
