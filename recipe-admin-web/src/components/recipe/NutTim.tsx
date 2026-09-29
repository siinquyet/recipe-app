import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';
import { layDanhSachYeuThichUser, themYeuThichUser, xoaYeuThichUser } from '../../api/congThuc';

// BR-SOC: Nút tim dùng chung — trạng thái thật từ /favorites, bấm để lưu/bỏ lưu qua API
export function NutTim({ id, ten }: { id: string; ten: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [dangGui, setDangGui] = useState(false);

  const yeuThich = useQuery({
    queryKey: ['user', 'favorites', 'ids'],
    queryFn: () => layDanhSachYeuThichUser(0, 100),
    enabled: !!nguoiDung,
  });
  const daLuu = (yeuThich.data?.noiDung ?? []).some((ct) => ct.id === id);

  async function bamTim() {
    if (!nguoiDung) {
      navigate('/dang-nhap');
      return;
    }
    setDangGui(true);
    try {
      if (daLuu) await xoaYeuThichUser(id);
      else await themYeuThichUser(id);
      // BR-SOC: Vô hiệu cache theo tiền tố để mọi trang (Trang chủ, Yêu thích, Chi tiết) cùng tươi
      await queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
    } finally {
      setDangGui(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={daLuu ? `Bỏ lưu ${ten}` : `Lưu ${ten}`}
      aria-pressed={daLuu}
      disabled={dangGui}
      onClick={(e) => {
        e.preventDefault();
        void bamTim();
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 transition hover:scale-105 disabled:opacity-60"
    >
      <HeartIcon className={`h-5 w-5 ${daLuu ? 'fill-danger text-danger' : 'text-ink'}`} />
    </button>
  );
}
