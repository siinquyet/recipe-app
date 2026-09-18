import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capNhatKeHoachAn,
  layChiTietKeHoachAn,
  layDanhSachKeHoachAn,
  taoKeHoachAn,
  themMonVaoKeHoach,
  xoaKeHoachAn,
} from '../lib/api/mealPlans';
import type { TaoKeHoachAnPayload, ThemMonVaoKeHoachPayload } from '../lib/api/mealPlans';
import { layChiTietDanhSachDiCho, layDanhSachDiCho, taoDanhSachDiCho } from '../lib/api/shoppingLists';
import type { TaoDanhSachDiChoPayload } from '../lib/api/shoppingLists';
import { capNhatTrangThaiMon, taoTuKeHoachAn } from '../lib/api/shoppingLists';
import { khoaTruyVan } from '../lib/queryClient';

export function useDanhSachKeHoachAn() {
  return useQuery({
    queryKey: khoaTruyVan.keHoachAn.danhSach(),
    queryFn: () => layDanhSachKeHoachAn(),
  });
}

export function useChiTietKeHoachAn(id: string) {
  return useQuery({
    queryKey: khoaTruyVan.keHoachAn.chiTiet(id),
    queryFn: () => layChiTietKeHoachAn(id),
    enabled: id.length > 0,
  });
}

export function useTaoKeHoachAn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaoKeHoachAnPayload) => taoKeHoachAn(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ke-hoach-an'] }),
  });
}

export function useCapNhatKeHoachAn(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TaoKeHoachAnPayload>) => capNhatKeHoachAn(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ke-hoach-an'] }),
  });
}

export function useXoaKeHoachAn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => xoaKeHoachAn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ke-hoach-an'] }),
  });
}

export function useThemMonVaoKeHoach(keHoachId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ThemMonVaoKeHoachPayload) => themMonVaoKeHoach(keHoachId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.chiTiet(keHoachId) }),
  });
}

export function useDanhSachDiCho() {
  return useQuery({
    queryKey: khoaTruyVan.danhSachDiCho.danhSach(),
    queryFn: () => layDanhSachDiCho(),
  });
}

export function useChiTietDanhSachDiCho(id: string) {
  return useQuery({
    queryKey: khoaTruyVan.danhSachDiCho.chiTiet(id),
    queryFn: () => layChiTietDanhSachDiCho(id),
    enabled: id.length > 0,
  });
}

export function useTaoDanhSachDiCho() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaoDanhSachDiChoPayload) => taoDanhSachDiCho(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-sach-di-cho'] }),
  });
}

// BR-SHOP: Sinh danh sách đi chợ từ kế hoạch ăn (server đã gộp + scale)
export function useTaoTuKeHoachAn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealPlanId: string) => taoTuKeHoachAn(mealPlanId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-sach-di-cho'] }),
  });
}

// BR-SHOP: Toggle đã mua với optimistic update để UI phản hồi ngay
export function useChuyenTrangThaiMon(listId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, daChon }: { itemId: string; daChon: boolean }) =>
      capNhatTrangThaiMon(listId, itemId, daChon),
    onSuccess: (duLieu) => queryClient.setQueryData(khoaTruyVan.danhSachDiCho.chiTiet(listId), duLieu),
  });
}
