import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { TitleText } from '../../components/ui/VanBan';
import { useAuthStore } from '../../stores/authStore';

// BR-AUTH: Mật khẩu theo backend (AUTH-05): hoa + thường + số, tối thiểu 6 ký tự
const schema = z.object({
  tenHienThi: z.string().min(2, 'Tên hiển thị tối thiểu 2 ký tự'),
  email: z.string().email('Email chưa đúng'),
  matKhau: z
    .string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Mật khẩu cần chữ hoa, chữ thường và số'),
});

type Form = z.infer<typeof schema>;

export function DangKy() {
  const navigate = useNavigate();
  const dangKy = useAuthStore((s) => s.dangKy);
  const { control, handleSubmit } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (form: Form) => {
    try {
      await dangKy(form.tenHienThi, form.email, form.matKhau);
      navigate('/');
    } catch {
      alert('[AUTH-01] Email đã được sử dụng');
    }
  };

  return (
    <div className="mx-auto max-w-md bg-white px-6 pb-8 pt-10">
      <TitleText className="text-3xl">Tạo tài khoản</TitleText>
      <p className="mt-1 text-left text-sm text-neutral-500">Tham gia cộng đồng nấu ăn cùng nhau</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="tenHienThi"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu nhan="Tên hiển thị" giaTri={value ?? ''} khiDoi={onChange} goiY="VD: Bếp Nhà" loi={error?.message} className="mt-6" />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu nhan="Email" giaTri={value ?? ''} khiDoi={onChange} goiY="ban@example.com" loi={error?.message} className="mt-4" />
          )}
        />
        <Controller
          control={control}
          name="matKhau"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu nhan="Mật khẩu" giaTri={value ?? ''} khiDoi={onChange} loai="password" loi={error?.message} className="mt-4" />
          )}
        />
        <NutBam tieuDe="Đăng ký" loai="submit" className="mt-6 w-full" />
      </form>
      <p className="mt-4 text-left text-sm text-neutral-500">
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="font-semibold text-accent-dark">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
