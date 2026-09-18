import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { BodyText, CaptionText, TitleText } from '../../components/ui/VanBan';
import { useAuthStore } from '../../stores/authStore';

// BR-AUTH: Cài đặt tối giản (backend chưa có đổi mật khẩu) — hiện tài khoản
export function CaiDat() {
  const nguoiDung = useAuthStore((s) => s.nguoiDung);

  return (
    <div className="mx-auto max-w-5xl bg-white px-4 pb-8 pt-4">
      <div className="flex items-center gap-2">
        <Link to="/ho-so" aria-label="Quay lại" className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
          <ChevronLeftIcon className="h-5 w-5 text-primary" />
        </Link>
        <TitleText className="text-xl">Cài đặt</TitleText>
      </div>
      <div className="mt-4 rounded-2xl bg-neutral-100 p-4">
        <CaptionText dam>Tài khoản</CaptionText>
        <BodyText className="mt-1">{nguoiDung?.tenHienThi ?? '—'}</BodyText>
        <BodyText>{nguoiDung?.email ?? '—'}</BodyText>
      </div>
    </div>
  );
}
