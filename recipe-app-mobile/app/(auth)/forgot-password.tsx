import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { BodyText, TitleText } from '../../src/components/ui/VanBan';

// S05: Backend chưa có API quên mật khẩu — UI khung, mô phỏng gửi thành công
export default function ManHinhQuenMatKhau() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [daGui, setDaGui] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <TitleText className="text-3xl">Quên mật khẩu</TitleText>
        <Text className="mt-1 text-left text-sm text-neutral-500">
          Nhập email để nhận hướng dẫn đặt lại mật khẩu
        </Text>

        {daGui ? (
          <View className="mt-6 rounded-2xl bg-accent-light p-4">
            <BodyText dam className="text-primary">
              Đã gửi hướng dẫn
            </BodyText>
            <BodyText className="mt-1 text-sm text-neutral-600">
              Nếu email {email} tồn tại trong hệ thống, bạn sẽ nhận được thư hướng dẫn đặt lại mật
              khẩu trong vài phút.
            </BodyText>
          </View>
        ) : (
          <ONhapLieu
            nhan="Email"
            giaTri={email}
            khiDoi={setEmail}
            goiY="ban@example.com"
            banPhim="email-address"
            className="mt-6"
          />
        )}

        {daGui ? (
          <NutBam tieuDe="Quay lại đăng nhập" khiBam={() => router.replace('/(auth)/login')} className="mt-6" />
        ) : (
          <NutBam
            tieuDe="Gửi hướng dẫn"
            voHieuHoa={!email.includes('@')}
            khiBam={() => setDaGui(true)}
            className="mt-6"
          />
        )}

        <Text className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/(auth)/login" className="font-semibold text-accent-dark">
            ← Về trang đăng nhập
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
