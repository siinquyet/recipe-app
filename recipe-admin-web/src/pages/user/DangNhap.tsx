import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { TitleText } from '../../components/ui/VanBan';
import { useAuthStore } from '../../stores/authStore';

const schema = z.object({
  email: z.string().email('Email chưa đúng'),
  matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type Form = z.infer<typeof schema>;

// BR-AUTH: Đăng nhập y mobile — logo kem, RHF+Zod, social báo chưa hỗ trợ
export function DangNhap() {
  const navigate = useNavigate();
  const dangNhap = useAuthStore((s) => s.dangNhap);
  const { control, handleSubmit } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (form: Form) => {
    try {
      await dangNhap(form.email, form.matKhau);
      navigate('/');
    } catch {
      alert('[AUTH-01] Email hoặc mật khẩu chưa đúng');
    }
  };

  return (
    <div className="mx-auto max-w-md bg-white px-6 pb-8 pt-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cream">
        <BookOpenIcon className="h-10 w-10 text-primary" />
      </div>
      <TitleText className="mt-8 text-3xl">Chào mừng trở lại</TitleText>
      <p className="mt-1 text-left text-sm text-neutral-500">Đăng nhập để khám phá công thức ngon</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu
              nhan="Email"
              giaTri={value ?? ''}
              khiDoi={onChange}
              goiY="ban@example.com"
              loi={error?.message}
              className="mt-6"
            />
          )}
        />
        <Controller
          control={control}
          name="matKhau"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu
              nhan="Mật khẩu"
              giaTri={value ?? ''}
              khiDoi={onChange}
              loai="password"
              loi={error?.message}
              className="mt-4"
            />
          )}
        />
        <NutBam tieuDe="Đăng nhập" loai="submit" className="mt-6 w-full" />
      </form>
      <p className="mt-3 text-right text-sm">
        <Link to="/quen-mat-khau" className="font-semibold text-deepteal">
          Quên mật khẩu?
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <NutBam tieuDe="Google" bienThe="phu" className="flex-1" khiBam={() => alert('Đăng nhập Google chưa hỗ trợ')} />
        <NutBam tieuDe="Apple" bienThe="phu" className="flex-1" khiBam={() => alert('Đăng nhập Apple chưa hỗ trợ')} />
      </div>
      <p className="mt-4 text-left text-sm text-neutral-500">
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="font-semibold text-accent-dark">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
