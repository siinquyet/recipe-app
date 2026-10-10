import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "../lib/api/client";
import { guiBaoCao, type GuiBaoCaoPayload } from "../lib/api/bao-cao";
import {
  capNhatCongThuc,
  forkCongThuc,
  guiDuyetCongThuc,
  layBanCaNhan,
  layBinhLuan,
  layChiTietCongThuc,
  layCongThucTuongTu,
  layDanhSachCongThuc,
  layDanhSachYeuThich,
  layPhanHoi,
  layTomTatDanhGia,
  suaBinhLuan,
  taoBinhLuan,
  taoCongThuc,
  themYeuThich,
  xoaBinhLuan,
  xoaCongThuc,
  xoaYeuThich,
} from "../lib/api/recipes";
import type {
  TaoCongThucPayload,
  ThamSoDanhSachCongThuc,
} from "../lib/api/recipes";
import { khoaTruyVan } from "../lib/queryClient";

export function useDanhSachCongThuc(thamSo: ThamSoDanhSachCongThuc) {
  return useQuery({
    queryKey: khoaTruyVan.congThuc.danhSach(thamSo),
    queryFn: () => layDanhSachCongThuc(thamSo),
    placeholderData: keepPreviousData,
  });
}

export function useChiTietCongThuc(id: string) {
  return useQuery({
    queryKey: khoaTruyVan.congThuc.chiTiet(id),
    queryFn: () => layChiTietCongThuc(id),
    enabled: id.length > 0,
  });
}

export function useCongThucTuongTu(id: string) {
  return useQuery({
    queryKey: khoaTruyVan.congThuc.tuongTu(id),
    queryFn: () => layCongThucTuongTu(id),
    enabled: id.length > 0,
  });
}

// BR-FORK: Bản riêng tư của chính mình (null nếu chưa fork)
export function useBanCaNhan(id: string, daDangNhap: boolean) {
  return useQuery({
    queryKey: khoaTruyVan.congThuc.banCaNhan(id),
    queryFn: () => layBanCaNhan(id),
    enabled: id.length > 0 && daDangNhap,
  });
}

// BR-FORK: Fork 1 chạm rồi sang màn sửa bản riêng tư
export function useForkCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gocId: string) => forkCongThuc(gocId),
    onSuccess: (_banFork, gocId) => {
      queryClient.invalidateQueries({
        queryKey: khoaTruyVan.congThuc.banCaNhan(gocId),
      });
    },
  });
}

export function useTaoCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaoCongThucPayload) => taoCongThuc(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cong-thuc"] }),
  });
}

export function useCapNhatCongThuc(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TaoCongThucPayload>) =>
      capNhatCongThuc(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: khoaTruyVan.congThuc.chiTiet(id),
      });
      queryClient.invalidateQueries({ queryKey: ["cong-thuc", "danh-sach"] });
    },
  });
}

export function useXoaCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => xoaCongThuc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cong-thuc"] }),
    // BR-UX: Bấm 2 lần (lần 2 đã mất → 404) vẫn coi như xong
    onError: (loi: unknown) => {
      if (loi instanceof ApiError && loi.status === 404) {
        queryClient.invalidateQueries({ queryKey: ["cong-thuc"] });
      }
    },
  });
}

// BR-UREC: Gửi duyệt để bài vào hàng chờ admin
export function useGuiDuyet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guiDuyetCongThuc(id),
    onSuccess: (_duLieu, id) => {
      queryClient.invalidateQueries({
        queryKey: khoaTruyVan.congThuc.chiTiet(id),
      });
      queryClient.invalidateQueries({ queryKey: ["cong-thuc", "danh-sach"] });
    },
  });
}

export function useChuyenDoiYeuThich(id: string, dangYeuThich: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (dangYeuThich ? xoaYeuThich(id) : themYeuThich(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: khoaTruyVan.congThuc.chiTiet(id),
      });
      queryClient.invalidateQueries({ queryKey: ["cong-thuc", "danh-sach"] });
    },
  });
}

// BR-SOC: Gửi tố cáo món ăn/bình luận về hàng chờ admin
export function useGuiBaoCao() {
  return useMutation({
    mutationFn: (payload: GuiBaoCaoPayload) => guiBaoCao(payload),
  });
}

export function useTaoBinhLuan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noiDung: string) => taoBinhLuan(id, noiDung),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: khoaTruyVan.congThuc.chiTiet(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["cong-thuc", "binh-luan", id],
      });
    },
  });
}

// BR-SOC: Danh sách bình luận thật của công thức (thay mock)
export function useBinhLuan(id: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ["cong-thuc", "binh-luan", id, page, size],
    queryFn: () => layBinhLuan(id, page, size),
    enabled: id.length > 0,
    placeholderData: keepPreviousData,
  });
}

// BR-SOC: Tổng quan đánh giá thật (trung bình + phân bổ sao)
export function useTomTatDanhGia(id: string) {
  return useQuery({
    queryKey: ["cong-thuc", "danh-gia", id],
    queryFn: () => layTomTatDanhGia(id),
    enabled: id.length > 0,
  });
}

// BR-SOC: Replies, sửa/xóa bình luận của chính mình
export function usePhanHoi(recipeId: string, commentId: string | null) {
  return useQuery({
    queryKey: ["cong-thuc", "binh-luan", recipeId, "phan-hoi", commentId],
    queryFn: () => layPhanHoi(recipeId, commentId as string),
    enabled: !!commentId && recipeId.length > 0,
  });
}

export function useSuaBinhLuan(recipeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      noiDung,
    }: {
      commentId: string;
      noiDung: string;
    }) => suaBinhLuan(recipeId, commentId, noiDung),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cong-thuc", "binh-luan", recipeId],
      });
    },
  });
}

export function useXoaBinhLuan(recipeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => xoaBinhLuan(recipeId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cong-thuc", "binh-luan", recipeId],
      });
    },
    onError: (loi: unknown) => {
      if (loi instanceof ApiError && loi.status === 404) {
        queryClient.invalidateQueries({
          queryKey: ["cong-thuc", "binh-luan", recipeId],
        });
      }
    },
  });
}

export function useTraLoiBinhLuan(recipeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chaId, noiDung }: { chaId: string; noiDung: string }) =>
      taoBinhLuan(recipeId, noiDung, chaId),
    onSuccess: (_duLieu, bien) => {
      queryClient.invalidateQueries({
        queryKey: ["cong-thuc", "binh-luan", recipeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["cong-thuc", "binh-luan", recipeId, "phan-hoi", bien.chaId],
      });
    },
  });
}

// BR-SOC: Danh sách yêu thích, tự invalidate khi đổi trạng thái tim
export function useDanhSachYeuThich(page = 0, size = 20) {
  return useQuery({
    queryKey: [
      ...khoaTruyVan.congThuc.danhSach({ yeuThich: true }),
      page,
      size,
    ],
    queryFn: () => layDanhSachYeuThich({ page, size }),
    placeholderData: keepPreviousData,
  });
}
