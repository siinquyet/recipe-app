import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, EnvelopeIcon, LockClosedIcon, UserIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { KhungXacThuc } from '../../components/auth/KhungXacThuc';
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
    <KhungXacThuc
      nhanPill="Tham gia Bếp Nhà"
      BieuTuongPill={UserPlusIcon}
      tieuDe="Tạo Tài Khoản"
      moTa="Tham gia cộng đồng nấu ăn cùng nhau — lưu món tủ, lên kế hoạch tuần, đi chợ thông minh."
      lienKetDuoi={{ nhan: 'Về trang chủ', den: '/' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          control={control}
          name="tenHienThi"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <ONhapLieu
              nhan="Tên hiển thị"
              giaTri={value ?? ''}
              khiDoi={onChange}
              goiY="VD: Bếp Nhà"
              loi={error?.message}
              bieuTuong={<UserIcon className="h-5 w-5" />}
            />
          )}
        />
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
              goiY="Hoa + thường + số, tối thiểu 6 ký tự"
              loi={error?.message}
              bieuTuong={<LockClosedIcon className="h-5 w-5" />}
            />
          )}
        />
        <NutBam
          tieuDe="Đăng ký"
          loai="submit"
          className="w-full py-4"
          bieuTuong={<ArrowRightIcon className="h-5 w-5" />}
        />
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="font-semibold text-deepteal">
          Đăng nhập
        </Link>
      </p>
    </KhungXacThuc>
  );
}
