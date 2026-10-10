import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatVn } from "@cook/shared";
import { layBaoCao, xuLyBaoCao, type HanhDongXuLy } from "../../api/admin";
import { NhanTrangThai } from "../../components/admin/NhanTrangThai";
import {
  BangAdmin,
  ChipLoc,
  ODuLieu,
  OTieuDe,
  PhanTrang,
  TheAdmin,
  TieuDeTrang,
} from "../../components/admin/KhungAdmin";

const KICH_THUOC = 20;
const CAC_TRANG_THAI = [
  { ma: "", nhan: "Tất cả" },
  { ma: "PENDING", nhan: "Chờ xử lý" },
  { ma: "RESOLVED", nhan: "Đã xử lý" },
  { ma: "REJECTED", nhan: "Đã bác" },
] as const;

// BR-SOC: Mã lý do backend (SPAM...) → tiếng Việt, khớp app mobile LY_DO_BAO_CAO
const LY_DO_VIET: Record<string, string> = {
  SPAM: "Spam / quảng cáo",
  INAPPROPRIATE: "Nội dung không phù hợp",
  COPYRIGHT: "Vi phạm bản quyền",
  FAKE: "Thông tin sai lệch",
  OTHER: "Lý do khác",
};

// BR-SOC: Tố cáo vi phạm — lọc trạng thái, xử lý kèm ghi chú, link sang món/bình luận gốc
export function ToCao() {
  const [trang, setTrang] = useState(0);
  const [trangThai, setTrangThai] = useState<string>("");
  const [ghiChu, setGhiChu] = useState<Record<string, string>>({});
  const [hanhDong, setHanhDong] = useState<Record<string, HanhDongXuLy>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "bao-cao", trang, trangThai],
    queryFn: () => layBaoCao(trang, KICH_THUOC, trangThai || undefined),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "bao-cao"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
  const xuLy = useMutation({
    mutationFn: ({
      id,
      ketQua,
    }: {
      id: string;
      ketQua: "RESOLVED" | "REJECTED";
    }) => xuLyBaoCao(id, ketQua, ghiChu[id]?.trim() || undefined, hanhDong[id]),
    onSuccess: lamMoi,
    onError: (e) =>
      alert(e instanceof Error ? e.message : "[REP-04] Không xử lý được"),
  });

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-danger">Không tải được danh sách tố cáo</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 rounded bg-primary px-4 py-2 text-white"
        >
          Thử lại
        </button>
      </div>
    );

  return (
    <div>
      <TieuDeTrang
        tieuDe={`Tố cáo (${formatVn(data.tongSoPhanTu)})`}
        moTa="Báo cáo vi phạm từ cộng đồng"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {CAC_TRANG_THAI.map((tt) => (
          <ChipLoc
            key={tt.ma}
            chon={trangThai === tt.ma}
            khiBam={() => {
              setTrangThai(tt.ma);
              setTrang(0);
            }}
          >
            {tt.nhan}
          </ChipLoc>
        ))}
      </div>
      {data.noiDung.length === 0 ? (
        <TheAdmin>
          <p className="text-left text-enterprise-subtle">
            Không có tố cáo nào.
          </p>
        </TheAdmin>
      ) : (
        <TheAdmin className="p-2 md:p-3">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Đối tượng</OTieuDe>
                <OTieuDe>Lý do</OTieuDe>
                <OTieuDe>Người báo cáo</OTieuDe>
                <OTieuDe>Trạng thái</OTieuDe>
                <OTieuDe>Ngày báo</OTieuDe>
                <OTieuDe>Xử lý</OTieuDe>
              </>
            }
            hang={data.noiDung.map((bc, i) => (
              <tr key={bc.id}>
                <ODuLieu className="number-vn">
                  {trang * KICH_THUOC + i + 1}
                </ODuLieu>
                <ODuLieu>
                  {bc.congThuc ? (
                    <Link
                      to={`/cong-thuc/${bc.congThuc.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Món: {bc.congThuc.ten}
                    </Link>
                  ) : bc.binhLuan ? (
                    <p className="text-sm text-enterprise-text">
                      Bình luận: “{bc.binhLuan.noiDung}”
                    </p>
                  ) : (
                    <p className="text-sm text-enterprise-subtle">—</p>
                  )}
                </ODuLieu>
                <ODuLieu className="text-sm font-semibold text-enterprise-text">
                  {LY_DO_VIET[bc.lyDo] ?? bc.lyDo}
                </ODuLieu>
                <ODuLieu>
                  <p className="text-sm font-semibold text-enterprise-text">
                    {bc.nguoiBaoCao.tenHienThi}
                  </p>
                  <p className="text-xs text-enterprise-subtle">
                    {bc.nguoiBaoCao.email}
                  </p>
                </ODuLieu>
                <ODuLieu>
                  <NhanTrangThai ma={bc.trangThai} />
                  {bc.ghiChuAdmin ? (
                    <p className="mt-1 text-xs text-enterprise-subtle">
                      {bc.ghiChuAdmin}
                    </p>
                  ) : null}
                </ODuLieu>
                <ODuLieu className="text-sm">
                  {format(new Date(bc.ngayTao), "dd/MM/yyyy")}
                </ODuLieu>
                <ODuLieu>
                  {bc.trangThai === "PENDING" ? (
                    <div className="flex min-w-44 flex-col gap-2">
                      <input
                        value={ghiChu[bc.id] ?? ""}
                        onChange={(e) =>
                          setGhiChu((cu) => ({
                            ...cu,
                            [bc.id]: e.target.value,
                          }))
                        }
                        placeholder="Ghi chú xử lý..."
                        aria-label={`Ghi chú ${bc.lyDo}`}
                        className="rounded-lg border-[1.5px] border-enterprise-border px-3 py-2 text-sm outline-none placeholder:text-enterprise-subtle focus:border-primary"
                      />
                      <button
                        type="button"
                        disabled={xuLy.isPending}
                        onClick={() =>
                          xuLy.mutate({ id: bc.id, ketQua: "RESOLVED" })
                        }
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                      >
                        Xác nhận vi phạm
                      </button>
                      <select
                        value={hanhDong[bc.id] ?? "KHONG"}
                        onChange={(e) =>
                          setHanhDong((cu) => ({
                            ...cu,
                            [bc.id]: e.target.value as HanhDongXuLy,
                          }))
                        }
                        aria-label="Hành động kèm theo"
                        className="rounded-lg border-[1.5px] border-enterprise-border bg-white px-2.5 py-2 text-sm font-semibold text-enterprise-text outline-none focus:border-primary"
                      >
                        <option value="KHONG">Chỉ đóng tố cáo</option>
                        {bc.congThuc ? (
                          <option value="AN_BAI">Ẩn luôn bài viết</option>
                        ) : null}
                        {bc.binhLuan ? (
                          <option value="XOA_BINH_LUAN">
                            Xóa luôn bình luận
                          </option>
                        ) : null}
                      </select>
                      <button
                        type="button"
                        disabled={xuLy.isPending}
                        onClick={() =>
                          xuLy.mutate({ id: bc.id, ketQua: "REJECTED" })
                        }
                        className="rounded-lg border-[1.5px] border-enterprise-border bg-white px-4 py-2 text-sm font-semibold text-enterprise-text transition hover:bg-enterprise-app disabled:opacity-50"
                      >
                        Bác báo cáo
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-enterprise-subtle">
                      Đã xong
                    </span>
                  )}
                </ODuLieu>
              </tr>
            ))}
          />
        </TheAdmin>
      )}
      <PhanTrang
        trang={trang}
        tongTrang={data.tongSoTrang}
        tongSo={data.tongSoPhanTu}
        donVi="tố cáo"
        lui={() => setTrang((t) => Math.max(0, t - 1))}
        toi={() => setTrang((t) => t + 1)}
      />
    </div>
  );
}
