import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatVn } from "@cook/shared";
import {
  Bars3Icon,
  BookOpenIcon,
  ChevronRightIcon,
  ClockIcon,
  FlagIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { dangXuatAdmin, layBaiChoDuyet } from "../api/admin";

const MUC_ADMIN = [
  {
    den: "/admin",
    nhan: "Tổng quan",
    het: true,
    Icon: HomeIcon,
    nhom: "Chính",
  },
  {
    den: "/admin/cho-duyet",
    nhan: "Chờ duyệt",
    het: false,
    Icon: ClockIcon,
    nhom: "Kiểm duyệt",
    badge: true,
  },
  {
    den: "/admin/to-cao",
    nhan: "Tố cáo",
    het: false,
    Icon: FlagIcon,
    nhom: "Kiểm duyệt",
  },
  {
    den: "/admin/cong-thuc",
    nhan: "Công thức",
    het: false,
    Icon: BookOpenIcon,
    nhom: "Nội dung",
  },
  {
    den: "/admin/danh-muc",
    nhan: "Danh mục",
    het: false,
    Icon: TagIcon,
    nhom: "Nội dung",
  },
  {
    den: "/admin/nguoi-dung",
    nhan: "Người dùng",
    het: false,
    Icon: UsersIcon,
    nhom: "Hệ thống",
  },
];

const TEN_DUONG_DAN: Record<string, string> = {
  "/admin": "Tổng quan",
  "/admin/cho-duyet": "Chờ duyệt",
  "/admin/to-cao": "Tố cáo",
  "/admin/cong-thuc": "Công thức",
  "/admin/danh-muc": "Danh mục",
  "/admin/nguoi-dung": "Người dùng",
};

// BR-ADM: Khung enterprise — sidebar dark 260/76 + header 60px + breadcrumb 40px
export function AdminLayout() {
  const navigate = useNavigate();
  const viTri = useLocation();
  const [moRong, setMoRong] = useState(
    () => localStorage.getItem("admin-sidebar") !== "gon",
  );
  const [tuKhoa, setTuKhoa] = useState("");
  const [moMenu, setMoMenu] = useState(false);
  const oTimKiem = useRef<HTMLInputElement>(null);

  const choDuyet = useQuery({
    queryKey: ["admin", "cho-duyet-dem"],
    queryFn: () => layBaiChoDuyet(0, 1),
    refetchInterval: 60_000,
  });
  const soChoDuyet = choDuyet.data?.tongSoPhanTu ?? 0;

  useEffect(() => {
    localStorage.setItem("admin-sidebar", moRong ? "rong" : "gon");
  }, [moRong]);

  useEffect(() => {
    const khiBamPhim = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        oTimKiem.current?.focus();
      }
    };
    window.addEventListener("keydown", khiBamPhim);
    return () => window.removeEventListener("keydown", khiBamPhim);
  }, []);

  const thoat = () => {
    dangXuatAdmin();
    navigate("/admin/dang-nhap");
  };

  const mucLoc = MUC_ADMIN.filter((m) =>
    tuKhoa.trim()
      ? m.nhan.toLowerCase().includes(tuKhoa.trim().toLowerCase())
      : true,
  );
  const nhomHienThi = moRong ? [...new Set(mucLoc.map((m) => m.nhom))] : [];
  const tenTrang = TEN_DUONG_DAN[viTri.pathname] ?? "Chi tiết";

  return (
    <div className="min-h-screen bg-enterprise-app font-sans text-enterprise-text">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-enterprise-sidebar text-slate-300 transition-all duration-200 ${
            moRong ? "w-[260px]" : "w-[76px]"
          }`}
        >
          <div className="flex h-[60px] shrink-0 items-center gap-2 border-b border-white/10 px-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              B
            </span>
            {moRong ? (
              <span className="truncate text-sm font-semibold text-white">
                Bếp Nhà · Admin
              </span>
            ) : null}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {moRong ? (
              nhomHienThi.map((nhom) => (
                <div key={nhom} className="mb-4 last:mb-0">
                  <p className="px-2 pb-2 text-[10.5px] font-bold uppercase tracking-widest text-slate-500">
                    {nhom}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {mucLoc
                      .filter((m) => m.nhom === nhom)
                      .map(({ den, nhan, het, Icon, badge }) => (
                        <NavLink
                          key={den}
                          to={den}
                          end={het}
                          className={({ isActive }) =>
                            `flex items-center gap-[10px] rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition duration-150 ${
                              isActive
                                ? "bg-white/10 text-white shadow-[inset_3px_0_0_#2563eb]"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-left">
                            {nhan}
                          </span>
                          {badge && soChoDuyet > 0 ? (
                            <span className="number-vn rounded bg-[#fef2f2] px-1.5 py-0.5 text-[10px] font-bold text-danger">
                              {formatVn(soChoDuyet)}
                            </span>
                          ) : null}
                        </NavLink>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-1">
                {mucLoc.map(({ den, nhan, het, Icon, badge }) => (
                  <NavLink
                    key={den}
                    to={den}
                    end={het}
                    title={nhan}
                    className={({ isActive }) =>
                      `relative flex items-center justify-center rounded-lg px-0 py-3 w-full transition duration-150 ${
                        isActive
                          ? "bg-white/10 text-white shadow-[inset_3px_0_0_#2563eb]"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {badge && soChoDuyet > 0 ? (
                      <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-danger" />
                    ) : null}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          <div className="shrink-0 border-t border-white/10 p-3">
            <div
              className={`flex items-center rounded-xl bg-white/5 p-2 ${moRong ? "gap-2" : "justify-center"}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success text-xs font-bold text-white">
                AD
              </span>
              {moRong ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-left text-xs font-semibold text-white">
                    Quản trị viên
                  </p>
                  <p className="truncate text-left text-[11px] text-slate-400">
                    admin@bepnha.vn
                  </p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setMoRong((c) => !c)}
              aria-label={moRong ? "Thu gọn sidebar" : "Mở rộng sidebar"}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white"
            >
              <Bars3Icon className="h-4 w-4" />
              {moRong ? "Thu gọn" : null}
            </button>
          </div>
        </aside>

        <div
          className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${moRong ? "pl-[260px]" : "pl-[76px]"}`}
        >
          <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-enterprise-border bg-white px-4 md:px-6">
            <div className="relative w-full max-w-[576px]">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={oTimKiem}
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
                placeholder="Tìm menu, công thức, người dùng..."
                aria-label="Tìm kiếm"
                className="w-full rounded-lg border border-enterprise-border bg-searchBg py-2 pl-9 pr-12 text-sm outline-none placeholder:text-slate-400 focus:border-primary"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-enterprise-border bg-white px-1.5 py-0.5 font-mono-vn text-[11px] text-slate-500">
                ⌘K
              </kbd>
            </div>
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setMoMenu((c) => !c)}
                aria-label="Menu người dùng"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success text-xs font-bold text-white"
              >
                AD
              </button>
              {moMenu ? (
                <div className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-enterprise-border bg-white shadow-card-hover">
                  <p className="border-b border-enterprise-border px-3 py-2 text-left text-xs text-enterprise-subtle">
                    admin@bepnha.vn
                  </p>
                  <button
                    type="button"
                    onClick={thoat}
                    className="w-full px-3 py-2 text-left text-sm font-semibold text-danger transition hover:bg-danger/5"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-enterprise-border bg-enterprise-app px-4 text-[13px] md:px-6">
            <span className="text-enterprise-subtle">Home</span>
            <ChevronRightIcon className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="text-enterprise-subtle">Dashboard</span>
            <ChevronRightIcon className="h-3.5 w-3.5 text-[#94a3b8]" />
            <span className="font-semibold text-enterprise-text">
              {tenTrang}
            </span>
          </div>

          <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
