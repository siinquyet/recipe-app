import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dangNhapAdmin } from '../../api/admin';

// BR-ADM: Đăng nhập quản trị — token riêng, sai quyền backend chặn 403
export function DangNhapAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState('');
  const [dangTai, setDangTai] = useState(false);

  const gui = async () => {
    if (!email.trim() || !matKhau) {
      setLoi('Vui lòng nhập đủ email và mật khẩu');
      return;
    }
    setLoi('');
    setDangTai(true);
    try {
      await dangNhapAdmin(email.trim(), matKhau);
      navigate('/admin');
    } catch (e) {
      setLoi(e instanceof Error ? e.message : '[ADM-01] Đăng nhập thất bại');
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 pb-8 pt-16">
      <h1 className="text-left text-2xl font-black">Bếp Nhà · Quản trị</h1>
      <p className="mt-1 text-left text-sm text-slate-500">Đăng nhập tài khoản ADMIN để điều hành</p>
      <label className="mt-6 block text-left text-sm font-semibold" htmlFor="admin-email">
        Email
      </label>
      <input
        id="admin-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@gmail.com"
        className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
      />
      <label className="mt-4 block text-left text-sm font-semibold" htmlFor="admin-mat-khau">
        Mật khẩu
      </label>
      <input
        id="admin-mat-khau"
        type="password"
        value={matKhau}
        onChange={(e) => setMatKhau(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') gui();
        }}
        className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
      />
      {loi ? <p className="mt-2 text-left text-sm text-red-600">{loi}</p> : null}
      <button
        type="button"
        disabled={dangTai}
        onClick={gui}
        className="mt-6 w-full rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {dangTai ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </div>
  );
}
