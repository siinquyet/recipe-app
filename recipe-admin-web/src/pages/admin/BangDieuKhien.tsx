import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatVn } from "@cook/shared";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { layDashboard } from "../../api/admin";
import {
  BangAdmin,
  ODuLieu,
  OTieuDe,
  TheAdmin,
} from "../../components/admin/KhungAdmin";

// BR-ADM: Tổng quan enterprise — hero + 4 stat + xu hướng bài viết + hoạt động gần đây
export function BangDieuKhien() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: layDashboard,
  });

  const cotBieuDo = useMemo(() => {
    if (!data) return [];
    const bai = data.tangTruongCongThuc.slice(-7);
    const nguoi = data.tangTruongNguoiDung.slice(-7);
    const maxBai = Math.max(1, ...bai.map((d) => d.soLuong));
    const maxNguoi = Math.max(1, ...nguoi.map((d) => d.soLuong));
    return bai.map((diem, i) => ({
      ngay: diem.ngay,
      xanh: Math.max(4, Math.round((diem.soLuong / maxBai) * 100)),
      luc: Math.max(4, Math.round(((nguoi[i]?.soLuong ?? 0) / maxNguoi) * 100)),
      soBai: diem.soLuong,
      soNguoi: nguoi[i]?.soLuong ?? 0,
    }));
  }, [data]);

  if (isLoading)
    return <p className="p-4 text-enterprise-subtle">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-danger">Không tải được số liệu</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-primary-dark"
        >
          Thử lại
        </button>
      </div>
    );

  const the = [
    {
      nhan: "Người dùng",
      so: data.tongNguoiDung,
      Icon: UsersIcon,
      hopMau: "bg-primary-light text-primary",
      tang: true,
      tiLe: "+12%",
    },
    {
      nhan: "Hoạt động 7 ngày",
      so: data.dangHoatDong,
      Icon: CheckCircleIcon,
      hopMau: "bg-green-50 text-success",
      tang: true,
      tiLe: "+8%",
    },
    {
      nhan: "Bài chờ duyệt",
      so: data.baiChoDuyet,
      Icon: ClockIcon,
      hopMau: "bg-amber-50 text-amber-600",
      tang: false,
      tiLe: data.baiChoDuyet > 0 ? "Cần xử lý" : "Trống",
      live: data.baiChoDuyet > 0,
    },
    {
      nhan: "Bài đã duyệt",
      so: data.baiDaDuyet,
      Icon: BookOpenIcon,
      hopMau: "bg-indigo-50 text-indigo-600",
      tang: true,
      tiLe: "+5%",
    },
  ];

  const hoatDong = [
    ...(data.baiChoDuyet > 0
      ? [
          {
            mau: "bg-amberDot animate-pulse-dot",
            tieuDe: `${formatVn(data.baiChoDuyet)} bài đang chờ duyệt`,
            chiTiet: "Hàng chờ live — cần xử lý",
          },
        ]
      : []),
    ...data.topDanhGia.slice(0, 3).map((dong) => ({
      mau: "bg-success",
      tieuDe: dong.ten,
      chiTiet: `${dong.diemTrungBinh} điểm • ${formatVn(dong.tongDanhGia)} lượt chấm`,
    })),
    ...data.tangTruongCongThuc.slice(-2).map((diem) => ({
      mau: "bg-primary",
      tieuDe: `${formatVn(diem.soLuong)} bài mới ngày ${diem.ngay}`,
      chiTiet: "Tăng trưởng công thức",
    })),
    ...data.tangTruongNguoiDung.slice(-2).map((diem) => ({
      mau: "bg-indigo-500",
      tieuDe: `${formatVn(diem.soLuong)} người dùng mới ngày ${diem.ngay}`,
      chiTiet: "Tăng trưởng người dùng",
    })),
  ].slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-left text-2xl font-semibold tracking-tight text-enterprise-text">
            Tổng quan
          </h1>
          <p className="mt-1 text-left text-sm text-enterprise-subtle">
            Nhịp đập của Bếp Nhà trong 7 ngày qua
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-enterprise-border bg-white px-3 py-2 text-sm font-medium text-enterprise-subtle">
            Last 7 Days
          </span>
          <button
            type="button"
            onClick={() => navigate("/admin/cho-duyet")}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-primary-dark"
          >
            <PlusIcon className="h-4 w-4" />
            Duyệt bài
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {the.map(({ nhan, so, Icon, hopMau, tang, tiLe, live }) => (
          <div
            key={nhan}
            className="rounded-xl border border-enterprise-border bg-white p-4 shadow-card transition duration-200 hover:scale-[1.01] hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${hopMau}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {live ? (
                <span className="h-2 w-2 rounded-full bg-amberDot animate-pulse-dot" />
              ) : null}
            </div>
            <p className="number-vn mt-3 text-left text-2xl font-semibold text-enterprise-text">
              {formatVn(so)}
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-left text-xs font-medium text-enterprise-subtle">
                {nhan}
              </p>
              <span
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  tang ? "bg-green-50 text-success" : "bg-red-50 text-danger"
                }`}
              >
                {tang ? (
                  <ArrowUpRightIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownRightIcon className="h-3 w-3" />
                )}
                {tiLe}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-enterprise-border bg-white p-5 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-left text-sm font-semibold text-enterprise-text">
              Xu hướng bài viết
            </h2>
            <div className="flex items-center gap-3 text-xs text-enterprise-subtle">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Bài mới
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Người
                dùng mới
              </span>
            </div>
          </div>
          <div className="mt-4 flex h-44 items-end gap-3">
            {cotBieuDo.map((cot) => (
              <div
                key={cot.ngay}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${cot.ngay}: ${formatVn(cot.soBai)} bài, ${formatVn(cot.soNguoi)} người`}
              >
                <div className="flex h-32 w-full items-end justify-center gap-1">
                  <div
                    className="w-full max-w-5 rounded-t bg-primary"
                    style={{ height: `${cot.xanh}%` }}
                  />
                  <div
                    className="w-full max-w-5 rounded-t bg-success"
                    style={{ height: `${cot.luc}%` }}
                  />
                </div>
                <span className="font-mono-vn w-full truncate text-center text-[10px] text-enterprise-subtle">
                  {cot.ngay.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-enterprise-border bg-white p-5 shadow-card">
          <h2 className="text-left text-sm font-semibold text-enterprise-text">
            Hoạt động gần đây
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {hoatDong.map((dong, i) => (
              <li
                key={`${dong.tieuDe}-${i}`}
                className="flex items-start gap-2.5"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dong.mau}`}
                />
                <div className="min-w-0">
                  <p className="truncate text-left text-[13px] font-semibold text-enterprise-text">
                    {dong.tieuDe}
                  </p>
                  <p className="text-left text-xs text-enterprise-subtle">
                    {dong.chiTiet}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TheAdmin>
        <h2 className="text-left text-sm font-semibold text-enterprise-text">
          Top đánh giá
        </h2>
        {data.topDanhGia.length === 0 ? (
          <p className="mt-2 text-left text-sm text-enterprise-subtle">
            Chưa có đánh giá nào.
          </p>
        ) : (
          <div className="mt-2">
            <BangAdmin
              tieuDeCot={
                <>
                  <OTieuDe>STT</OTieuDe>
                  <OTieuDe>Tên món</OTieuDe>
                  <OTieuDe className="text-right">Điểm TB</OTieuDe>
                  <OTieuDe className="text-right">Lượt chấm</OTieuDe>
                </>
              }
              hang={data.topDanhGia.map((dong, i) => (
                <tr key={dong.id}>
                  <ODuLieu className="number-vn">{i + 1}</ODuLieu>
                  <ODuLieu>
                    <span className="font-semibold text-enterprise-text">
                      {dong.ten}
                    </span>
                  </ODuLieu>
                  <ODuLieu className="number-vn font-mono-vn font-semibold text-enterprise-text">
                    {dong.diemTrungBinh}
                  </ODuLieu>
                  <ODuLieu className="number-vn">
                    {formatVn(dong.tongDanhGia)}
                  </ODuLieu>
                </tr>
              ))}
            />
          </div>
        )}
      </TheAdmin>
    </div>
  );
}
