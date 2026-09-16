import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capNhatCongThuc,
  layChiTietCongThuc,
  layCongThucTuongTu,
  layDanhSachCongThuc,
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

export function useChuyenDoiYeuThich(id: string, dangYeuThich: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => (dangYeuThich ? xoaYeuThich(id) : themYeuThich(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) }),
  });
}

export function useTaoBinhLuan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noiDung: string) => taoBinhLuan(id, noiDung),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: khoaTruyVan.congThuc.chiTiet(id) }),
  });
}
