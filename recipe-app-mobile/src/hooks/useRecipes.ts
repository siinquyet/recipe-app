import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capNhatCongThuc,
  guiDuyetCongThuc,
  layBinhLuan,
  layChiTietCongThuc,
  layCongThucTuongTu,
  layDanhSachCongThuc,
  layDanhSachYeuThich,
  taoBinhLuan,
  taoCongThuc,
  themYeuThich,
  xoaCongThuc,
  xoaYeuThich,
} from '../lib/api/recipes';
import type { TaoCongThucPayload, ThamSoDanhSachCongThuc } from '../lib/api/recipes';
import { khoaTruyVan } from '../lib/queryClient';

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

export function useTaoCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaoCongThucPayload) => taoCongThuc(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-thuc'] }),
  });
}

export function useCapNhatCongThuc(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TaoCongThucPayload>) => capNhatCongThuc(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) });
      queryClient.invalidateQueries({ queryKey: ['cong-thuc', 'danh-sach'] });
    },
  });
}

export function useXoaCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => xoaCongThuc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-thuc'] }),
  });
}

// BR-UREC: Gửi duyệt để bài vào hàng chờ admin
export function useGuiDuyet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guiDuyetCongThuc(id),
    onSuccess: (_duLieu, id) => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) });
      queryClient.invalidateQueries({ queryKey: ['cong-thuc', 'danh-sach'] });
    },
  });
}

export function useChuyenDoiYeuThich(id: string, dangYeuThich: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (dangYeuThich ? xoaYeuThich(id) : themYeuThich(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) });
      queryClient.invalidateQueries({ queryKey: ['cong-thuc', 'danh-sach'] });
    },
  });
}

export function useTaoBinhLuan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noiDung: string) => taoBinhLuan(id, noiDung),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) });
      queryClient.invalidateQueries({ queryKey: ['cong-thuc', 'binh-luan', id] });
    },
  });
}

// BR-SOC: Danh sách bình luận thật của công thức (thay mock)
export function useBinhLuan(id: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['cong-thuc', 'binh-luan', id, page, size],
    queryFn: () => layBinhLuan(id, page, size),
    enabled: id.length > 0,
    placeholderData: keepPreviousData,
  });
}

// BR-SOC: Danh sách yêu thích, tự invalidate khi đổi trạng thái tim
export function useDanhSachYeuThich(page = 0, size = 20) {
  return useQuery({
    queryKey: [...khoaTruyVan.congThuc.danhSach({ yeuThich: true }), page, size],
    queryFn: () => layDanhSachYeuThich({ page, size }),
    placeholderData: keepPreviousData,
  });
}
