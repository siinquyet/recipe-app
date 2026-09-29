import { Link } from 'react-router-dom';

// BR-UI: Trang tĩnh — không gọi API
export function LienHe() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <span className="font-semibold text-ink">Liên hệ</span>
      </p>
      <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-ink">Liên hệ Bếp Nhà</h1>
      <div className="mt-6 rounded-40px bg-white p-6 shadow-magazine md:p-8">
        <p className="rounded-xl bg-mist px-4 py-3 text-left text-sm">
          <span className="block text-xs text-muted">Email hỗ trợ</span>
          <strong className="text-ink">hotro@bepnha.vn</strong>
        </p>
        <p className="mt-3 text-left text-sm leading-6 text-slate-600">
          Gửi kèm ảnh chụp màn hình và mô tả các bước tái hiện lỗi — đội ngũ sẽ phản hồi trong 2 ngày làm việc.
        </p>
      </div>
    </div>
  );
}
