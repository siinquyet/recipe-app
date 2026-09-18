import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BellIcon, ChevronRightIcon, Cog6ToothIcon, LinkIcon, ShieldCheckIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { CaptionText, TitleText } from '../../components/ui/VanBan';
import { layDanhSachCongThucUser, layDanhSachYeuThichUser } from '../../api/congThuc';
import { useAuthStore } from '../../stores/authStore';

const KHOA_CHU_DE = 'bepnha.chuDeQuanTam';
const KHOA_THONG_BAO = 'bepnha.thongBao';

const CHU_DE_GO_Y = ['Ít dầu mỡ, thanh nhẹ', 'Ưu tiên rau củ tươi mùa nào thức nấy', 'Hạn chế đường tinh luyện', 'Thuần vị quê hương', 'Món ăn nhanh dưới 30 phút'] as const;

function docJSON<T>(khoa: string, macDinh: T): T {
  try {
    const raw = localStorage.getItem(khoa);
    return raw ? (JSON.parse(raw) as T) : macDinh;
  } catch {
    return macDinh;
  }
}

// BR-AUTH: Hồ sơ mẫu Stitch — info + số liệu thật, tùy chọn lưu máy (localStorage)
export function HoSo() {
  const navigate = useNavigate();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const dangXuat = useAuthStore((s) => s.dangXuat);
  const [chuDe, setChuDe] = useState<string[]>(() => docJSON(KHOA_CHU_DE, []));
  const [thongBao, setThongBao] = useState<boolean>(() => docJSON(KHOA_THONG_BAO, true));

  const cuaToi = useQuery({
    queryKey: ['user', 'recipes', 'cua-toi-dem', nguoiDung?.id],
    queryFn: () => layDanhSachCongThucUser({ trang: 0, kichThuoc: 1, tacGiaId: nguoiDung?.id }),
    enabled: !!nguoiDung?.id,
  });
  const yeuThich = useQuery({
    queryKey: ['user', 'favorites', 'dem'],
    queryFn: () => layDanhSachYeuThichUser(0, 1),
    enabled: !!nguoiDung,
  });

  const doiChuDe = (ten: string) => {
    setChuDe((cu) => {
      const moi = cu.includes(ten) ? cu.filter((c) => c !== ten) : [...cu, ten];
      localStorage.setItem(KHOA_CHU_DE, JSON.stringify(moi));
      return moi;
    });
  };
  const doiThongBao = () => {
    setThongBao((cu) => {
      localStorage.setItem(KHOA_THONG_BAO, JSON.stringify(!cu));
      return !cu;
    });
  };

  if (!nguoiDung) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center">
        <TitleText canLe="giua">Bạn chưa đăng nhập</TitleText>
        <CaptionText canLe="giua" className="mt-1">Đăng nhập để xem hồ sơ của bạn</CaptionText>
        <NutBam tieuDe="Đăng nhập" className="mx-auto mt-4 w-48" khiBam={() => navigate('/dang-nhap')} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <span className="font-semibold text-ink">Hồ sơ cá nhân & Cài đặt</span>
      </p>
      <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">Cài Đặt Gian Bếp</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside>
          <div className="rounded-40px bg-white p-6 text-center shadow-magazine">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-light font-serif text-3xl font-black text-ink">
              {nguoiDung.tenHienThi.trim().charAt(0).toUpperCase()}
            </span>
            <p className="mt-3 font-serif text-xl font-black text-ink">{nguoiDung.tenHienThi}</p>
            <CaptionText canLe="giua">{nguoiDung.email}</CaptionText>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-mist p-3">
                <p className="font-serif text-xl font-black text-ink">
                  <NumberDisplay value={cuaToi.data?.tongSoPhanTu ?? 0} />
                </p>
                <CaptionText canLe="giua">Công thức</CaptionText>
              </div>
              <div className="rounded-2xl bg-mist p-3">
                <p className="font-serif text-xl font-black text-ink">
                  <NumberDisplay value={yeuThich.data?.tongSoPhanTu ?? 0} />
                </p>
                <CaptionText canLe="giua">Lượt lưu</CaptionText>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-40px bg-white p-3 shadow-magazine">
            {[
              { nhan: 'Thông tin cá nhân', Icon: Squares2X2Icon },
              { nhan: 'Sở thích & Chế độ ăn', Icon: Cog6ToothIcon },
              { nhan: 'Thông báo', Icon: BellIcon },
              { nhan: 'Bảo mật', Icon: ShieldCheckIcon },
              { nhan: 'Liên kết mạng xã hội', Icon: LinkIcon },
            ].map(({ nhan, Icon }) => (
              <span key={nhan} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink first:bg-accent-light/60">
                <Icon className="h-5 w-5 text-deepteal" />
                {nhan}
                <ChevronRightIcon className="ml-auto h-4 w-4 text-muted" />
              </span>
            ))}
            <button
              type="button"
              onClick={() => {
                dangXuat();
                navigate('/');
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-danger"
            >
              Đăng xuất tài khoản
            </button>
          </div>
        </aside>

        <div className="rounded-40px bg-white p-5 shadow-magazine md:p-8">
          <CaptionText dam>Phần 01</CaptionText>
          <h2 className="font-serif text-2xl font-black text-ink">Thông Tin Bếp Cá Nhân</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <p className="rounded-xl bg-mist px-4 py-3 text-left text-sm">
              <span className="block text-xs text-muted">Họ và tên</span>
              <strong className="text-ink">{nguoiDung.tenHienThi}</strong>
            </p>
            <p className="rounded-xl bg-mist px-4 py-3 text-left text-sm">
              <span className="block text-xs text-muted">Địa chỉ Email</span>
              <strong className="text-ink">{nguoiDung.email}</strong>
            </p>
          </div>

          <CaptionText dam className="mt-8">Phần 02</CaptionText>
          <h2 className="font-serif text-2xl font-black text-ink">Thói Quen Ăn Uống</h2>
          <p className="mt-1 text-left text-sm text-slate-500">
            Chọn chủ đề bạn quan tâm (lưu trên máy này).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CHU_DE_GO_Y.map((c) => {
              const chon = chuDe.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => doiChuDe(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    chon ? 'bg-deepteal text-white' : 'bg-mist text-slate-500'
                  }`}
                >
                  {chon ? '✓ ' : ''}{c}
                </button>
              );
            })}
          </div>

          <CaptionText dam className="mt-8">Phần 03</CaptionText>
          <h2 className="font-serif text-2xl font-black text-ink">Thông Báo Nấu Nướng</h2>
          <button
            type="button"
            onClick={doiThongBao}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-mist p-4 text-left"
            aria-pressed={thongBao}
          >
            <BellIcon className="h-6 w-6 shrink-0 text-deepteal" />
            <span className="flex-1">
              <strong className="block text-sm text-ink">Nhắc nhở thực đơn ngày mai</strong>
              <span className="text-xs text-slate-500">Gợi ý mâm cơm chiều lúc 17:30 mỗi ngày</span>
            </span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${thongBao ? 'bg-deepteal' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${thongBao ? 'left-[22px]' : 'left-0.5'}`} />
            </span>
          </button>
          <p className="mt-4 text-left text-xs text-muted">
            Đổi mật khẩu và liên kết mạng xã hội sẽ có khi backend hỗ trợ — hiện tài khoản của bạn đã an toàn.
          </p>
        </div>
      </div>
    </div>
  );
}
