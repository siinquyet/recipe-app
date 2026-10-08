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
      <div className="rounded-40px bg-white p-8 shadow-magazine">
        <p className="inline-block rounded-full bg-accent-light/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
          Quản trị
        </p>
        <h1 className="mt-3 text-left font-serif text-3xl font-black tracking-tight text-ink">Bếp Nhà · Quản trị</h1>
        <p className="mt-1 text-left text-sm text-muted">Đăng nhập tài khoản ADMIN để điều hành</p>
        <label className="mt-6 block text-left text-sm font-semibold text-ink" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@gmail.com"
          className="mt-1 w-full rounded-xl border-[1.5px] border-muted/40 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent focus:outline-2 focus:outline-accent-light"
        />
        <label className="mt-4 block text-left text-sm font-semibold text-ink" htmlFor="admin-mat-khau">
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
          className="mt-1 w-full rounded-xl border-[1.5px] border-muted/40 bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent focus:outline-2 focus:outline-accent-light"
        />
        {loi ? <p className="mt-2 text-left text-sm font-semibold text-danger">{loi}</p> : null}
        <button
          type="button"
          disabled={dangTai}
          onClick={gui}
          className="mt-6 w-full rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {dangTai ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
}
