import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface KhungXacThucProps {
  nhanPill: string;
  BieuTuongPill: ComponentType<{ className?: string }>;
  tieuDe: string;
  moTa: string;
  children: ReactNode;
  lienKetDuoi?: { nhan: string; den: string };
}

// BR-UI: Khung Editorial dùng chung cho Đăng nhập/Đăng ký/Quên mật khẩu (DESIGN.md)
export function KhungXacThuc({ nhanPill, BieuTuongPill, tieuDe, moTa, children, lienKetDuoi }: KhungXacThucProps) {
  return (
    <div className="bg-mist px-4 py-10">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-magazine sm:p-12">
        <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-accent-light/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-mist blur-2xl" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cream p-3 shadow-sm">
            <img src="/logo-bep-nha.png" alt="Bếp Nhà" className="h-full w-full rounded-xl object-cover" />
          </div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-widest text-deepteal">
            <BieuTuongPill className="h-3.5 w-3.5" />
            {nhanPill}
          </span>
          <h1 className="font-serif text-4xl font-black tracking-tight text-ink">{tieuDe}</h1>
          <p className="mb-8 mt-3 max-w-lg text-base text-neutral-500">{moTa}</p>
          <div className="w-full text-left">{children}</div>
          {lienKetDuoi ? (
            <Link
              to={lienKetDuoi.den}
              className="mt-8 inline-flex items-center gap-2 py-1 text-sm font-semibold text-deepteal hover:text-ink"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {lienKetDuoi.nhan}
            </Link>
          ) : null}
          <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-4 text-center sm:flex-row">
            <span className="text-sm text-neutral-500">
              Gặp khó khăn? Liên hệ <span className="font-medium text-ink">Đội ngũ hỗ trợ Bếp Nhà</span>:
            </span>
            <span className="flex items-center gap-2 text-sm">
              <a href="tel:19006868" className="font-semibold text-deepteal hover:underline">
                <PhoneIcon className="mr-1 inline h-4 w-4" />
                1900 6868
              </a>
              <span>•</span>
              <a href="mailto:hotro@bepnha.vn" className="font-semibold text-deepteal hover:underline">
                hotro@bepnha.vn
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
