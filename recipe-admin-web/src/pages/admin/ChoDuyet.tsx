import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatVn } from "@cook/shared";
import {
  chayKiemDuyetTuDong,
  duyetBai,
  hoanTacQuyetDinh,
  layBaiChoDuyet,
  layTatCaBai,
  tuChoiBai,
  type BaiAdmin,
} from "../../api/admin";
import {
  BangAdmin,
  ChipLoc,
  NutDuyet,
  NutTuChoi,
  ODuLieu,
  OTieuDe,
  PhanTrang,
  TheAdmin,
  TieuDeTrang,
} from "../../components/admin/KhungAdmin";

const KICH_THUOC = 20;

type Tab = "cho" | "da-duyet" | "da-tu-choi";

const NHAN_GOI_Y: Record<string, { nhan: string; mau: string }> = {
  "nen-duyet": { nhan: "Nên duyệt", mau: "text-primary" },
  "giu-lai": { nhan: "Giữ lại xem tay", mau: "text-amber-600" },
  "nen-tu-choi": { nhan: "Nên từ chối", mau: "text-danger" },
};

const TABS: Array<{ ma: Tab; nhan: string }> = [
  { ma: "cho", nhan: "Chờ duyệt" },
  { ma: "da-duyet", nhan: "Đã duyệt" },
  { ma: "da-tu-choi", nhan: "Đã từ chối" },
];

function CotGoiY({ bai }: { bai: BaiAdmin }) {
  const goiY = bai.nhanGoiY ? NHAN_GOI_Y[bai.nhanGoiY] : null;
  if (!goiY) return <span className="text-enterprise-subtle">—</span>;
  return (
    <div className="text-left">
      <p className={`text-sm font-bold ${goiY.mau}`}>
        {goiY.nhan} ({formatVn(bai.diemTuDong ?? 0)}đ)
      </p>
      {(bai.lyDoGoiY ?? []).map((lyDo) => (
        <p key={lyDo} className="text-xs text-enterprise-subtle">
          • {lyDo}
        </p>
      ))}
    </div>
  );
}

// BR-ADM: Hàng chờ duyệt — duyệt 1 chạm, từ chối phải nhập lý do
// BR-ADM-AUTO: Cột gợi ý từ pipeline + nút chạy kiểm duyệt + hoàn tác quyết định
export function ChoDuyet() {
  const [tab, setTab] = useState<Tab>("cho");
  const [trang, setTrang] = useState(0);
  const [lyDo, setLyDo] = useState<Record<string, string>>({});
  const [ketQuaChay, setKetQuaChay] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "cho-duyet", tab, trang],
    queryFn: () =>
      tab === "cho"
        ? layBaiChoDuyet(trang, KICH_THUOC)
        : layTatCaBai(
            trang,
            KICH_THUOC,
            tab === "da-duyet" ? "APPROVED" : "REJECTED",
          ),
  });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "cho-duyet"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "cho-duyet-dem"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
  const duyet = useMutation({ mutationFn: duyetBai, onSuccess: lamMoi });
  const tuChoi = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tuChoiBai(id, reason),
    onSuccess: lamMoi,
  });
  const hoanTac = useMutation({
    mutationFn: hoanTacQuyetDinh,
    onSuccess: lamMoi,
    onError: () => alert("[ADM-06] Không hoàn tác được"),
  });
  const chayTuDong = useMutation({
    mutationFn: chayKiemDuyetTuDong,
    onSuccess: (kq) => {
      setKetQuaChay(
        kq.cheDoTuDong
          ? `Máy đã duyệt ${kq.daDuyet}, từ chối ${kq.daTuChoi}, giữ lại ${kq.giuLai}/${kq.tong} bài`
          : `Chế độ gợi ý: ${kq.tong} bài chờ, máy chưa tự quyết bài nào`,
      );
      lamMoi();
    },
    onError: () => alert("[ADM-00] Không chạy được pipeline"),
  });
  const doiTab = (t: Tab) => {
    setTab(t);
    setTrang(0);
  };

  if (isLoading) return <p className="p-4">Đang tải...</p>;
  if (isError || !data)
    return (
      <div className="p-4">
        <p className="text-left text-danger">Không tải được hàng chờ</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 rounded bg-primary px-4 py-2 text-white"
        >
          Thử lại
        </button>
      </div>
    );

  const tieuDe =
    tab === "cho"
      ? "Chờ duyệt"
      : tab === "da-duyet"
        ? "Đã duyệt"
        : "Đã từ chối";

  return (
    <div>
      <TieuDeTrang
        tieuDe={`${tieuDe} (${formatVn(data.tongSoPhanTu)})`}
        moTa="Duyệt 1 chạm, từ chối cần ghi lý do"
        benPhai={
          <button
            type="button"
            disabled={chayTuDong.isPending}
            onClick={() => chayTuDong.mutate()}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            Chạy kiểm duyệt
          </button>
        }
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <ChipLoc key={t.ma} chon={tab === t.ma} khiBam={() => doiTab(t.ma)}>
            {t.nhan}
          </ChipLoc>
        ))}
      </div>
      {ketQuaChay ? (
        <p className="mt-2 text-left text-sm text-enterprise-subtle">
          {ketQuaChay}
        </p>
      ) : null}
      {data.noiDung.length === 0 ? (
        <TheAdmin>
          <p className="text-left text-enterprise-subtle">Không có bài nào.</p>
        </TheAdmin>
      ) : (
        <TheAdmin className="p-2 md:p-3">
          <BangAdmin
            tieuDeCot={
              <>
                <OTieuDe>STT</OTieuDe>
                <OTieuDe>Tên món</OTieuDe>
                <OTieuDe>Tác giả</OTieuDe>
                <OTieuDe>Gợi ý máy</OTieuDe>
                <OTieuDe>Ngày gửi</OTieuDe>
                <OTieuDe>Xử lý</OTieuDe>
              </>
            }
            hang={data.noiDung.map((bai, i) => (
              <tr key={bai.id}>
                <ODuLieu className="number-vn">
                  {trang * KICH_THUOC + i + 1}
                </ODuLieu>
                <ODuLieu>
                  <p className="font-bold text-enterprise-text">{bai.ten}</p>
                  {bai.moTa ? (
                    <p className="mt-1 text-xs text-enterprise-subtle">
                      {bai.moTa}
                    </p>
                  ) : null}
                  {(bai.canhBao ?? []).map((cb) => (
                    <p
                      key={cb.cap.join("+")}
                      className={`mt-1 text-left text-xs font-semibold ${
                        cb.muc === "cao" ? "text-danger" : "text-amber-600"
                      }`}
                    >
                      {cb.muc === "cao" ? "Cảnh báo độc: " : "Lưu ý combo: "}
                      {cb.lyDo}
                    </p>
                  ))}
                  {bai.lyDoTuChoi ? (
                    <p className="mt-1 text-left text-xs text-enterprise-subtle">
                      Lý do từ chối: {bai.lyDoTuChoi}
                    </p>
                  ) : null}
                </ODuLieu>
                <ODuLieu>
                  <p className="text-sm font-semibold text-enterprise-text">
                    {bai.tacGia.tenHienThi}
                  </p>
                  <p className="text-xs text-enterprise-subtle">
                    {bai.tacGia.email}
                  </p>
                </ODuLieu>
                <ODuLieu>
                  <CotGoiY bai={bai} />
                </ODuLieu>
                <ODuLieu className="text-sm">
                  {format(new Date(bai.ngayTao), "dd/MM/yyyy")}
                </ODuLieu>
                <ODuLieu>
                  {tab === "cho" ? (
                    <div className="flex min-w-44 flex-col gap-2">
                      <NutDuyet
                        tat={duyet.isPending}
                        khiBam={() => duyet.mutate(bai.id)}
                      />
                      <input
                        value={lyDo[bai.id] ?? ""}
                        onChange={(e) =>
                          setLyDo((cu) => ({ ...cu, [bai.id]: e.target.value }))
                        }
                        placeholder="Lý do từ chối..."
                        aria-label={`Lý do từ chối ${bai.ten}`}
                        className="rounded-lg border-[1.5px] border-enterprise-border px-3 py-2 text-sm outline-none placeholder:text-enterprise-subtle focus:border-primary"
                      />
                      <NutTuChoi
                        tat={tuChoi.isPending || !(lyDo[bai.id] ?? "").trim()}
                        khiBam={() =>
                          tuChoi.mutate({
                            id: bai.id,
                            reason: (lyDo[bai.id] ?? "").trim(),
                          })
                        }
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={hoanTac.isPending}
                      onClick={() => hoanTac.mutate(bai.id)}
                      className="rounded-lg border-[1.5px] border-primary bg-primary-light px-4 py-2 text-sm font-semibold text-enterprise-text transition hover:bg-primary-light disabled:opacity-50"
                    >
                      Hoàn tác
                    </button>
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
        donVi="bài"
        lui={() => setTrang((t) => Math.max(0, t - 1))}
        toi={() => setTrang((t) => t + 1)}
      />
    </div>
  );
}
