import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';
import { useDangNhap } from '../../src/hooks/useAuth';
import { dangNhapSchema, type DangNhapForm } from '../../src/lib/validation/schemas';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TitleText } from '../../src/components/ui/VanBan';

// S06: Social auth chưa có API backend — UI khung, bấm sẽ hiện thông báo
function NutXaHoi({ nhan }: { nhan: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {}}
      className="flex-1 items-center rounded-xl border border-neutral-300 bg-white px-4 py-3"
    >
      <Text className="text-sm font-medium text-neutral-700">{nhan}</Text>
    </Pressable>
  );
}

export default function ManHinhDangNhap() {
  const router = useRouter();
  const mutation = useDangNhap();
  const [ghiNho, setGhiNho] = useState(true);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DangNhapForm>({ resolver: zodResolver(dangNhapSchema) });

  const guiDi = handleSubmit(async (duLieu) => {
    await mutation.mutateAsync(duLieu);
    router.replace('/(tabs)');
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <View className="h-20 w-20 items-center justify-center self-center rounded-3xl bg-cream">
          <BookOpen size={40} color="#0A2533" />
        </View>

        <TitleText className="mt-8 text-3xl">Chào mừng trở lại</TitleText>
        <Text className="mt-1 text-left text-sm text-neutral-500">
          Đăng nhập để khám phá công thức ngon
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <ONhapLieu
              nhan="Email"
              giaTri={value ?? ''}
              khiDoi={onChange}
              goiY="ban@example.com"
              banPhim="email-address"
              loi={errors.email?.message}
              className="mt-6"
            />
          )}
        />
        <Controller
          control={control}
          name="matKhau"
          render={({ field: { value, onChange } }) => (
            <ONhapLieu
              nhan="Mật khẩu"
              giaTri={value ?? ''}
              khiDoi={onChange}
              anChu
              goiY="Tối thiểu 8 ký tự"
              loi={errors.matKhau?.message}
              className="mt-4"
            />
          )}
        />

        <View className="mt-3 flex-row items-center justify-between">
          <Pressable accessibilityRole="checkbox" onPress={() => setGhiNho((v) => !v)} className="flex-row items-center gap-2">
            <View
              className={`h-5 w-5 items-center justify-center rounded-md border ${
                ghiNho ? 'border-primary bg-primary' : 'border-neutral-300 bg-white'
              }`}
            >
              {ghiNho ? <Text className="text-xs font-bold text-white">✓</Text> : null}
            </View>
            <Text className="text-sm text-neutral-700">Ghi nhớ tôi</Text>
          </Pressable>
          <Link href="/(auth)/forgot-password" className="text-sm font-medium text-accent-dark">
            Quên mật khẩu?
          </Link>
        </View>

        {mutation.isError ? (
          <Text className="mt-3 text-left text-sm text-red-600">
            {(mutation.error as Error)?.message ?? 'Đăng nhập thất bại'}
          </Text>
        ) : null}

        <NutBam tieuDe="Đăng nhập" khiBam={guiDi} dangTai={mutation.isPending} className="mt-6" />

        <View className="mt-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="text-xs text-neutral-500">hoặc tiếp tục với</Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>
        <View className="mt-4 flex-row gap-3">
          <NutXaHoi nhan="Google" />
          <NutXaHoi nhan="Apple" />
          <NutXaHoi nhan="Facebook" />
        </View>

        <Text className="mt-6 text-center text-sm text-neutral-500">
          Chưa có tài khoản?{' '}
          <Link href="/(auth)/register" className="font-semibold text-accent-dark">
            Đăng ký
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
