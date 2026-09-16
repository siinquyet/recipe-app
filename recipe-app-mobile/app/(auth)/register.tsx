import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDangKy } from '../../src/hooks/useAuth';
import { dangKySchema, type DangKyForm } from '../../src/lib/validation/schemas';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TitleText } from '../../src/components/ui/VanBan';

export default function ManHinhDangKy() {
  const router = useRouter();
  const mutation = useDangKy();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DangKyForm>({ resolver: zodResolver(dangKySchema) });

  const guiDi = handleSubmit(async (duLieu) => {
    await mutation.mutateAsync(duLieu);
    router.replace('/(tabs)');
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <TitleText className="text-3xl">Tạo tài khoản</TitleText>
        <Text className="mt-1 text-left text-sm text-neutral-500">
          Tham gia cộng đồng nấu ăn cùng nhau
        </Text>

        <Controller
          control={control}
          name="tenHienThi"
          render={({ field: { value, onChange } }) => (
            <ONhapLieu
              nhan="Tên hiển thị"
              giaTri={value ?? ''}
              khiDoi={onChange}
              goiY="VD: Bếp Nhà"
              loi={errors.tenHienThi?.message}
              className="mt-6"
            />
          )}
        />
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
              className="mt-4"
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
              goiY="Hoa + thường + số, tối thiểu 8 ký tự"
              loi={errors.matKhau?.message}
              className="mt-4"
            />
          )}
        />

        {mutation.isError ? (
          <Text className="mt-3 text-left text-sm text-red-600">
            {(mutation.error as Error)?.message ?? 'Đăng ký thất bại'}
          </Text>
        ) : null}

        <NutBam tieuDe="Đăng ký" khiBam={guiDi} dangTai={mutation.isPending} className="mt-6" />

        <Text className="mt-4 text-center text-sm text-neutral-500">
          Đã có tài khoản?{' '}
          <Link href="/(auth)/login" className="font-semibold text-accent-dark">
            Đăng nhập
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
