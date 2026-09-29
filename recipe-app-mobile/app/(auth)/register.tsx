import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { ArrowRight, Lock, Mail, User, UserPlus } from 'lucide-react-native';
import { useDangKy } from '../../src/hooks/useAuth';
import { dangKySchema, type DangKyForm } from '../../src/lib/validation/schemas';
import { KhungXacThuc } from '../../src/components/auth/KhungXacThuc';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';

// BR-AUTH: Đăng ký khung Editorial đồng bộ web — RHF+Zod, mật khẩu hoa+thường+số
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
    <KhungXacThuc
      nhanPill="Tham gia Bếp Nhà"
      BieuTuongPill={UserPlus}
      tieuDe="Tạo Tài Khoản"
      moTa="Tham gia cộng đồng nấu ăn cùng nhau — lưu món tủ, lên kế hoạch tuần, đi chợ thông minh."
      lienKetDuoi={{ nhan: 'Về trang chủ', duongDan: '/(tabs)' }}
    >
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
            bieuTuong={<User size={20} color="#97A2B0" />}
          />
        )}
      />
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
            className="mt-4"
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
            goiY="Hoa + thường + số, tối thiểu 8 ký tự"
            loi={errors.matKhau?.message}
            className="mt-4"
            bieuTuong={<Lock size={20} color="#97A2B0" />}
          />
        )}
      />

      {mutation.isError ? (
        <Text className="mt-3 text-left text-sm text-red-600">
          {(mutation.error as Error)?.message ?? 'Đăng ký thất bại'}
        </Text>
      ) : null}

      <NutBam
        tieuDe="Đăng ký"
        khiBam={guiDi}
        dangTai={mutation.isPending}
        className="mt-6 py-4"
        bieuTuong={<ArrowRight size={20} color="#fff" />}
      />

      <Text className="mt-4 text-center text-sm text-neutral-500">
        Đã có tài khoản?{' '}
        <Link href="/(auth)/login" className="font-semibold text-accent-dark">
          Đăng nhập
        </Link>
      </Text>
    </KhungXacThuc>
  );
}
