import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, EnvelopeIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { KhungXacThuc } from '../../components/auth/KhungXacThuc';
import { useAuthStore } from '../../stores/authStore';

const schema = z.object({
  email: z.string().email('Email chưa đúng'),
  matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type Form = z.infer<typeof schema>;

// BR-AUTH: Đăng nhập khung Editorial — logo, pill, RHF+Zod, social báo chưa hỗ trợ
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
    <KhungXacThuc
      nhanPill="Chào mừng trở lại"
      BieuTuongPill={KeyIcon}
      tieuDe="Đăng Nhập"
      moTa="Đăng nhập để khám phá hàng ngàn công thức ngon và lưu lại món tủ của bạn."
      lienKetDuoi={{ nhan: 'Về trang chủ', den: '/' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu
              nhan="Địa chỉ Email"
              giaTri={value ?? ''}
              khiDoi={onChange}
              goiY="ban@example.com"
              loi={error?.message}
              bieuTuong={<EnvelopeIcon className="h-5 w-5" />}
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
              goiY="Nhập mật khẩu của bạn"
              loi={error?.message}
              bieuTuong={<LockClosedIcon className="h-5 w-5" />}
            />
          )}
        />
        <p className="text-right text-sm">
          <Link to="/quen-mat-khau" className="font-semibold text-deepteal">
            Quên mật khẩu?
          </Link>
        </p>
        <NutBam
          tieuDe="Đăng nhập"
          loai="submit"
          className="w-full py-4"
          bieuTuong={<ArrowRightIcon className="h-5 w-5" />}
        />
      </form>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-500">hoặc tiếp tục với</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>
      <div className="mt-4 flex gap-2">
        <NutBam tieuDe="Google" bienThe="phu" className="flex-1" khiBam={() => alert('Đăng nhập Google chưa hỗ trợ')} />
        <NutBam tieuDe="Apple" bienThe="phu" className="flex-1" khiBam={() => alert('Đăng nhập Apple chưa hỗ trợ')} />
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="font-semibold text-deepteal">
          Đăng ký
        </Link>
      </p>
    </KhungXacThuc>
  );
}
