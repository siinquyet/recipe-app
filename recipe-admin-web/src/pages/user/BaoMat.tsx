import { Link } from 'react-router-dom';

const MUC = [
  {
    tieuDe: '1. Dữ liệu chúng tôi lưu',
    noiDung:
      'Email, tên hiển thị, công thức, lượt yêu thích, đánh giá và kế hoạch bữa ăn của bạn. Mật khẩu được băm bcrypt, không ai đọc được.',
  },
  {
    tieuDe: '2. Token đăng nhập',
    noiDung:
      'Access/refresh token (JWT) lưu trong bộ nhớ thiết bị của bạn để giữ đăng nhập. Đăng xuất sẽ xóa ngay.',
  },
  {
    tieuDe: '3. Không bán dữ liệu',
    noiDung: 'Bếp Nhà không bán hay chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích quảng cáo.',
  },
];

// BR-UI: Trang tĩnh — không gọi API
export function BaoMat() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <span className="font-semibold text-ink">Bảo mật</span>
      </p>
      <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-ink">Chính sách bảo mật</h1>
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
