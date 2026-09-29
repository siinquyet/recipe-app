import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react-native';
import { useDangNhap } from '../../src/hooks/useAuth';
import { dangNhapSchema, type DangNhapForm } from '../../src/lib/validation/schemas';
import { KhungXacThuc } from '../../src/components/auth/KhungXacThuc';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';

// S06: Social auth chưa có API backend — bấm hiện thông báo rõ ràng thay vì im lặng
function NutXaHoi({ nhan, khiBam }: { nhan: string; khiBam: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={khiBam}
      className="flex-1 items-center rounded-xl border border-neutral-300 bg-white px-4 py-3"
    >
      <Text className="text-sm font-medium text-neutral-700">{nhan}</Text>
    </Pressable>
  );
}

// BR-AUTH: Đăng nhập khung Editorial đồng bộ web — RHF+Zod, social báo chưa hỗ trợ
export default function ManHinhDangNhap() {
  const router = useRouter();
  const mutation = useDangNhap();
  const [ghiNho, setGhiNho] = useState(true);
  const [thongBaoSocial, setThongBaoSocial] = useState<string | null>(null);
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
    <KhungXacThuc
      nhanPill="Chào mừng trở lại"
      BieuTuongPill={KeyRound}
      tieuDe="Đăng Nhập"
      moTa="Đăng nhập để khám phá hàng ngàn công thức ngon và lưu lại món tủ của bạn."
      lienKetDuoi={{ nhan: 'Về trang chủ', duongDan: '/(tabs)' }}
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange } }) => (
          <ONhapLieu
            nhan="Địa chỉ Email"
            giaTri={value ?? ''}
            khiDoi={onChange}
            goiY="ban@example.com"
            banPhim="email-address"
            loi={errors.email?.message}
            bieuTuong={<Mail size={20} color="#97A2B0" />}
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
            goiY="Nhập mật khẩu của bạn"
            loi={errors.matKhau?.message}
            className="mt-4"
            bieuTuong={<Lock size={20} color="#97A2B0" />}
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

      <NutBam
        tieuDe="Đăng nhập"
        khiBam={guiDi}
        dangTai={mutation.isPending}
        className="mt-6 py-4"
        bieuTuong={<ArrowRight size={20} color="#fff" />}
      />

      <View className="mt-6 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-neutral-200" />
        <Text className="text-xs text-neutral-500">hoặc tiếp tục với</Text>
        <View className="h-px flex-1 bg-neutral-200" />
      </View>
      <View className="mt-4 flex-row gap-3">
        <NutXaHoi nhan="Google" khiBam={() => setThongBaoSocial('Đăng nhập Google chưa hỗ trợ trong bản này')} />
        <NutXaHoi nhan="Apple" khiBam={() => setThongBaoSocial('Đăng nhập Apple chưa hỗ trợ trong bản này')} />
        <NutXaHoi nhan="Facebook" khiBam={() => setThongBaoSocial('Đăng nhập Facebook chưa hỗ trợ trong bản này')} />
      </View>
      {thongBaoSocial ? (
        <Text className="mt-3 text-center text-sm text-neutral-500">{thongBaoSocial}</Text>
      ) : null}

      <Text className="mt-6 text-center text-sm text-neutral-500">
        Chưa có tài khoản?{' '}
        <Link href="/(auth)/register" className="font-semibold text-accent-dark">
          Đăng ký
        </Link>
      </Text>
    </KhungXacThuc>
  );
}
