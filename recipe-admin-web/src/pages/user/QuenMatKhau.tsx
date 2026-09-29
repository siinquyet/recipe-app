import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightIcon, CheckCircleIcon, EnvelopeIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { KhungXacThuc } from '../../components/auth/KhungXacThuc';
import { userApiClient } from '../../api/userClient';

const schema = z.object({
  email: z.string().email('Email chưa đúng'),
});

type Form = z.infer<typeof schema>;

const CAC_BUOC = ['Nhập Email', 'Xác thực OTP', 'Mật khẩu mới'] as const;

// BR-AUTH: Quên mật khẩu (POST /auth/forgot-password) — khung Editorial + thang 3 bước theo DESIGN.md
export function QuenMatKhau() {
  const [daGui, setDaGui] = useState(false);
  const { control, handleSubmit } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (form: Form) => {
    try {
      await userApiClient.post('/auth/forgot-password', { email: form.email });
      setDaGui(true);
    } catch {
      alert('[AUTH-02] Không gửi được, thử lại sau');
    }
  };

  return (
    <KhungXacThuc
      nhanPill="Hỗ trợ tài khoản"
      BieuTuongPill={ShieldCheckIcon}
      tieuDe="Khôi Phục Mật Khẩu"
      moTa="Đừng lo lắng! Hãy nhập địa chỉ email đã đăng ký của bạn. Bếp Nhà sẽ gửi mã xác thực 6 số (hoặc liên kết đặt lại mật khẩu) trong vòng vài phút."
      lienKetDuoi={{ nhan: 'Quay lại Đăng nhập', den: '/dang-nhap' }}
    >
      <div className="mb-8 flex items-start justify-between px-2 sm:px-4">
        {CAC_BUOC.map((buoc, i) => {
          const buocHienTai = daGui ? 1 : 0;
          const xong = i < buocHienTai;
          const dangLam = i === buocHienTai;
          return (
            <div key={buoc} className="relative z-10 flex flex-1 flex-col items-center">
              {i > 0 ? (
                <span
                  className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                    i <= buocHienTai ? 'bg-deepteal' : 'bg-neutral-200'
                  }`}
                />
              ) : null}
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ring-4 ring-white ${
                  xong || dangLam ? 'bg-ink text-white' : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-2 text-center text-xs font-semibold ${
                  xong || dangLam ? 'text-ink' : 'text-neutral-400'
                }`}
              >
                {buoc}
              </span>
            </div>
          );
        })}
      </div>

      {daGui ? (
        <div className="flex items-start gap-3 rounded-xl bg-accent-light p-4 text-left">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-deepteal" />
          <div className="text-sm">
            <p className="font-semibold text-ink">Đã gửi mã xác nhận!</p>
            <p className="mt-0.5 text-deepteal">
              Mã OTP 6 số đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra và hoàn thành bước tiếp theo.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <ONhapLieu
                nhan="Địa chỉ Email đăng ký"
                giaTri={value ?? ''}
                khiDoi={onChange}
                goiY="linhdan.cuisine@gmail.com"
                loi={error?.message}
                bieuTuong={<EnvelopeIcon className="h-5 w-5" />}
              />
            )}
          />
          <div className="flex items-start gap-3 rounded-xl bg-surface p-4">
            <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-deepteal" />
            <p className="text-sm leading-relaxed text-neutral-500">
              <strong className="font-medium text-ink">Lưu ý:</strong> Nếu không nhận được thư trong Hộp
              thư đến, vui lòng kiểm tra thêm thư mục <em>Quảng cáo</em> hoặc <em>Thư rác (Spam)</em>.
            </p>
          </div>
          <NutBam
            tieuDe="Gửi mã khôi phục mật khẩu"
            loai="submit"
            className="w-full py-4"
            bieuTuong={<ArrowRightIcon className="h-5 w-5" />}
          />
        </form>
      )}
    </KhungXacThuc>
  );
}
