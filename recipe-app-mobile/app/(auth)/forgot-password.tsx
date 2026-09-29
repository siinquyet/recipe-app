import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ArrowRight, Info, Mail, ShieldCheck } from 'lucide-react-native';
import { KhungXacThuc } from '../../src/components/auth/KhungXacThuc';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangLoi } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText } from '../../src/components/ui/VanBan';
import { quenMatKhau } from '../../src/lib/api/auth';

const CAC_BUOC = ['Nhập Email', 'Xác thực OTP', 'Mật khẩu mới'] as const;

// BR-AUTH: Quên mật khẩu khung Editorial đồng bộ web — thang 3 bước theo DESIGN.md
export default function ManHinhQuenMatKhau() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [daGui, setDaGui] = useState(false);
  const guiMail = useMutation({
    mutationFn: () => quenMatKhau(email.trim()),
    onSuccess: () => setDaGui(true),
  });

  return (
    <KhungXacThuc
      nhanPill="Hỗ trợ tài khoản"
      BieuTuongPill={ShieldCheck}
      tieuDe="Khôi Phục Mật Khẩu"
      moTa="Đừng lo lắng! Hãy nhập địa chỉ email đã đăng ký của bạn. Bếp Nhà sẽ gửi mã xác thực 6 số (hoặc liên kết đặt lại mật khẩu) trong vòng vài phút."
      lienKetDuoi={{ nhan: 'Quay lại Đăng nhập', duongDan: '/(auth)/login' }}
    >
      <View className="mb-6 flex-row items-start justify-between px-2">
        {CAC_BUOC.map((buoc, i) => {
          const buocHienTai = daGui ? 1 : 0;
          const sang = i <= buocHienTai;
          return (
            <View key={buoc} className="flex-1 items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  sang ? 'bg-primary' : 'bg-neutral-200'
                }`}
              >
                <Text className={`text-sm font-bold ${sang ? 'text-white' : 'text-neutral-500'}`}>{i + 1}</Text>
              </View>
              <CaptionText canLe="giua" className={`mt-1 ${sang ? 'font-semibold text-primary' : ''}`}>
                {buoc}
              </CaptionText>
            </View>
          );
        })}
      </View>

      {daGui ? (
        <View className="rounded-2xl bg-accent-light p-4">
          <BodyText dam className="text-primary">
            Đã gửi mã xác nhận!
          </BodyText>
          <BodyText className="mt-1 text-sm text-neutral-600">
            Mã OTP 6 số đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra và hoàn thành bước tiếp theo.
          </BodyText>
        </View>
      ) : (
        <View>
          <ONhapLieu
            nhan="Địa chỉ Email đăng ký"
            giaTri={email}
            khiDoi={setEmail}
            goiY="linhdan.cuisine@gmail.com"
            banPhim="email-address"
            bieuTuong={<Mail size={20} color="#97A2B0" />}
          />
          <View className="mt-4 flex-row gap-2 rounded-2xl bg-mist p-4">
            <Info size={18} color="#0A2533" />
            <BodyText className="flex-1 text-sm text-neutral-500">
              <Text className="font-medium text-primary">Lưu ý:</Text> Nếu không nhận được thư trong Hộp thư
              đến, vui lòng kiểm tra thêm thư mục Quảng cáo hoặc Thư rác (Spam).
            </BodyText>
          </View>
          {guiMail.isError && (
            <TrangLoi loi={(guiMail.error as Error)?.message ?? 'Không gửi được, thử lại sau'} />
          )}
        </View>
      )}

      {daGui ? (
        <NutBam
          tieuDe="Quay lại đăng nhập"
          khiBam={() => router.replace('/(auth)/login')}
          className="mt-6 py-4"
        />
      ) : (
        <NutBam
          tieuDe="Gửi mã khôi phục mật khẩu"
          voHieuHoa={!email.includes('@')}
          dangTai={guiMail.isPending}
          khiBam={() => guiMail.mutate()}
          className="mt-6 py-4"
          bieuTuong={<ArrowRight size={20} color="#fff" />}
        />
      )}
    </KhungXacThuc>
  );
}
