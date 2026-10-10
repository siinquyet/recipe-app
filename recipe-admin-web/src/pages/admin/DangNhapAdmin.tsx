import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dangNhapAdmin } from "../../api/admin";

// BR-ADM: Đăng nhập quản trị — token riêng, sai quyền backend chặn 403
export function DangNhapAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState("");
  const [dangTai, setDangTai] = useState(false);

  const gui = async () => {
    if (!email.trim() || !matKhau) {
      setLoi("Vui lòng nhập đủ email và mật khẩu");
      return;
    }
    setLoi("");
    setDangTai(true);
    try {
      await dangNhapAdmin(email.trim(), matKhau);
      navigate("/admin");
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "[ADM-01] Đăng nhập thất bại");
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="min-h-screen bg-enterprise-app font-sans">
      <div className="mx-auto max-w-md px-6 pb-8 pt-16">
        <div className="rounded-xl border border-enterprise-border bg-white p-8 shadow-card">
          <p className="inline-block rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-enterprise-text">
            Quản trị
          </p>
          <h1 className="mt-3 text-left text-3xl font-black tracking-tight text-enterprise-text">
            Bếp Nhà · Quản trị
          </h1>
          <p className="mt-1 text-left text-sm text-enterprise-subtle">
            Đăng nhập tài khoản ADMIN để điều hành
          </p>
          <label
            className="mt-6 block text-left text-sm font-semibold text-enterprise-text"
            htmlFor="admin-email"
          >
            Email
          </label>
          <input
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gmail.com"
            className="mt-1 w-full rounded-lg border-[1.5px] border-enterprise-border bg-white px-4 py-3 text-sm text-enterprise-text outline-none placeholder:text-enterprise-subtle focus:border-primary focus:outline-2 focus:outline-primary"
          />
          <label
            className="mt-4 block text-left text-sm font-semibold text-enterprise-text"
            htmlFor="admin-mat-khau"
          >
            Mật khẩu
          </label>
          <input
            id="admin-mat-khau"
            type="password"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") gui();
            }}
            className="mt-1 w-full rounded-lg border-[1.5px] border-enterprise-border bg-white px-4 py-3 text-sm text-enterprise-text outline-none placeholder:text-enterprise-subtle focus:border-primary focus:outline-2 focus:outline-primary"
          />
          {loi ? (
            <p className="mt-2 text-left text-sm font-semibold text-danger">
              {loi}
            </p>
          ) : null}
          <button
            type="button"
            disabled={dangTai}
            onClick={gui}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {dangTai ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
