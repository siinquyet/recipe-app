import { Link } from 'react-router-dom';

const MUC = [
  {
    tieuDe: '1. Nội dung bạn đăng',
    noiDung:
      'Bạn giữ bản quyền công thức của mình và cho Bếp Nhà quyền hiển thị trong ứng dụng. Bài viết trải qua kiểm duyệt (Nháp → Chờ duyệt → Đã duyệt) trước khi công khai.',
  },
  {
    tieuDe: '2. Hành xử cộng đồng',
    noiDung:
      'Không đăng nội dung vi phạm pháp luật, xúc phạm người khác hoặc quảng cáo trá hình. Vi phạm có thể bị ẩn bài hoặc khóa tài khoản.',
  },
  {
    tieuDe: '3. Miễn trừ',
    noiDung:
      'Công thức do cộng đồng đóng góp mang tính tham khảo. Bếp Nhà không chịu trách nhiệm về dị ứng hay sự cố khi nấu theo hướng dẫn.',
  },
];

// BR-UI: Trang tĩnh — không gọi API
export function DieuKhoan() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <span className="font-semibold text-ink">Điều khoản</span>
      </p>
      <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-ink">Điều khoản sử dụng</h1>
      <div className="mt-6 rounded-40px bg-white p-6 shadow-magazine md:p-8">
        {MUC.map((m) => (
          <div key={m.tieuDe} className="mt-4 first:mt-0">
            <h2 className="text-left font-serif text-xl font-bold text-ink">{m.tieuDe}</h2>
            <p className="mt-1 text-left text-sm leading-6 text-slate-600">{m.noiDung}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
