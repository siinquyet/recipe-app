import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatVn } from "@cook/shared";
import {
  layDanhMuc,
  layNhan,
  taoDanhMuc,
  taoNhan,
  xoaDanhMuc,
  xoaNhan,
} from "../../api/admin";
import { TieuDeTrang } from "../../components/admin/KhungAdmin";

function KhoiThem({
  nhan,
  goiY,
  khiThem,
  dangThem,
}: {
  nhan: string;
  goiY: string;
  khiThem: (ten: string) => void;
  dangThem: boolean;
}) {
  const [ten, setTen] = useState("");
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ten.trim()) return;
        khiThem(ten.trim());
        setTen("");
      }}
    >
      <input
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        placeholder={goiY}
        aria-label={nhan}
        className="w-full rounded-lg border-[1.5px] border-enterprise-border bg-white px-4 py-2.5 text-sm text-enterprise-text outline-none placeholder:text-enterprise-subtle focus:border-primary"
      />
      <button
        type="submit"
        disabled={dangThem || !ten.trim()}
        className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
      >
        Thêm
      </button>
    </form>
  );
}

// BR-ADM: Danh mục + nhãn — thêm/xóa, chặn xóa khi còn món dùng (backend báo rõ)
export function DanhMuc() {
  const queryClient = useQueryClient();
  const danhMuc = useQuery({
    queryKey: ["admin", "danh-muc"],
    queryFn: layDanhMuc,
  });
  const nhan = useQuery({ queryKey: ["admin", "nhan"], queryFn: layNhan });
  const lamMoi = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "danh-muc"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "nhan"] });
  };
  const themDM = useMutation({
    mutationFn: taoDanhMuc,
    onSuccess: lamMoi,
    onError: (e) => alert(e instanceof Error ? e.message : "Không thêm được"),
  });
  const xoaDM = useMutation({
    mutationFn: xoaDanhMuc,
    onSuccess: lamMoi,
    onError: (e) => alert(e instanceof Error ? e.message : "Không xóa được"),
  });
  const themNhan = useMutation({
    mutationFn: taoNhan,
    onSuccess: lamMoi,
    onError: (e) => alert(e instanceof Error ? e.message : "Không thêm được"),
  });
  const goNhan = useMutation({
    mutationFn: xoaNhan,
    onSuccess: lamMoi,
    onError: (e) => alert(e instanceof Error ? e.message : "Không xóa được"),
  });

  const xacNhanXoa = (ten: string, khiXoa: () => void) => {
    if (window.confirm(`Xóa “${ten}”? Không xóa được nếu còn món đang dùng.`))
      khiXoa();
  };

  return (
    <div>
      <TieuDeTrang
        tieuDe="Danh mục & Nhãn"
        moTa="Phân loại chuẩn để món gắn đúng"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-enterprise-border bg-white p-5 shadow-card md:p-6">
          <h2 className="text-left text-xl font-bold text-enterprise-text">
            Danh mục ({formatVn(danhMuc.data?.length ?? 0)})
          </h2>
          {danhMuc.isError ? (
            <p className="mt-2 text-left text-sm text-danger">Không tải được</p>
          ) : (
            <ul className="mt-2">
              {(danhMuc.data ?? []).map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between border-b border-enterprise-border py-2.5 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-enterprise-text">
                      {d.ten}
                    </p>
                    <p className="font-mono text-xs text-enterprise-subtle">
                      {d.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={xoaDM.isPending}
                    onClick={() => xacNhanXoa(d.ten, () => xoaDM.mutate(d.id))}
                    className="rounded-lg border-[1.5px] border-danger/40 px-3 py-1.5 text-sm font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
          <KhoiThem
            nhan="Tên danh mục"
            goiY="VD: Món khai vị"
            khiThem={(t) => themDM.mutate(t)}
            dangThem={themDM.isPending}
          />
        </section>
        <section className="rounded-xl border border-enterprise-border bg-white p-5 shadow-card md:p-6">
          <h2 className="text-left text-xl font-bold text-enterprise-text">
            Nhãn ({formatVn(nhan.data?.length ?? 0)})
          </h2>
          {nhan.isError ? (
            <p className="mt-2 text-left text-sm text-danger">Không tải được</p>
          ) : (
            <ul className="mt-2">
              {(nhan.data ?? []).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between border-b border-enterprise-border py-2.5 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-enterprise-text">
                      {t.ten}
                    </p>
                    <p className="font-mono text-xs text-enterprise-subtle">
                      {t.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={goNhan.isPending}
                    onClick={() => xacNhanXoa(t.ten, () => goNhan.mutate(t.id))}
                    className="rounded-lg border-[1.5px] border-danger/40 px-3 py-1.5 text-sm font-semibold text-danger transition hover:bg-danger/5 disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
          <KhoiThem
            nhan="Tên nhãn"
            goiY="VD: Ăn chay"
            khiThem={(t) => themNhan.mutate(t)}
            dangThem={themNhan.isPending}
          />
        </section>
      </div>
    </div>
  );
}
