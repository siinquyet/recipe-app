import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  capNhatKeHoachAn,
  capNhatMonTrongKeHoach,
  layChiTietKeHoachAn,
  layDanhSachKeHoachAn,
  taoKeHoachAn,
  themMonVaoKeHoach,
  xoaKeHoachAn,
  xoaMonKhoiKeHoach,
} from '../lib/api/mealPlans';
import type { CapNhatMonTrongKeHoachPayload, TaoKeHoachAnPayload, ThemMonVaoKeHoachPayload } from '../lib/api/mealPlans';
import { layChiTietDanhSachDiCho, layDanhSachDiCho, taoDanhSachDiCho } from '../lib/api/shoppingLists';
import type { CapNhatDanhSachDiChoPayload, TaoDanhSachDiChoPayload } from '../lib/api/shoppingLists';
import { capNhatDanhSachDiCho, capNhatTrangThaiMon, taoTuCongThuc, taoTuKeHoachAn, xoaDanhSachDiCho } from '../lib/api/shoppingLists';
import type { DanhSachDiCho } from '../types/api';
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.chiTiet(keHoachId) });
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.danhSach() });
    },
  });
}

// BR-MEAL: Đổi khẩu phần món trong kế hoạch
export function useCapNhatMonTrongKeHoach(keHoachId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ monId, payload }: { monId: string; payload: CapNhatMonTrongKeHoachPayload }) =>
      capNhatMonTrongKeHoach(keHoachId, monId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.chiTiet(keHoachId) });
    },
  });
}

// BR-MEAL: Xóa món khỏi kế hoạch
export function useXoaMonKhoiKeHoach(keHoachId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monId: string) => xoaMonKhoiKeHoach(keHoachId, monId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.chiTiet(keHoachId) });
    },
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

// BR-SHOP: Sinh danh sách đi chợ từ 1 công thức (gộp + scale khẩu phần)
export function useTaoTuCongThuc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ congThucId, khauPhan }: { congThucId: string; khauPhan?: number }) =>
      taoTuCongThuc(congThucId, khauPhan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-sach-di-cho'] }),
  });
}

// BR-SHOP: Đổi tên / chuyển trạng thái danh sách
export function useCapNhatDanhSachDiCho() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CapNhatDanhSachDiChoPayload }) =>
      capNhatDanhSachDiCho(id, payload),
    onSuccess: (_duLieu, bien) => {
      queryClient.invalidateQueries({ queryKey: ['danh-sach-di-cho'] });
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.danhSachDiCho.chiTiet(bien.id) });
    },
  });
}

// BR-SHOP: Xóa (archive) danh sách đi chợ
export function useXoaDanhSachDiCho() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => xoaDanhSachDiCho(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['danh-sach-di-cho'] }),
  });
}

// BR-SHOP: Toggle đã mua với optimistic update để UI phản hồi ngay
export function useChuyenTrangThaiMon(listId: string) {
  const queryClient = useQueryClient();
  const khoaChiTiet = khoaTruyVan.danhSachDiCho.chiTiet(listId);
  return useMutation({
    mutationFn: ({ itemId, daChon }: { itemId: string; daChon: boolean }) =>
      capNhatTrangThaiMon(listId, itemId, daChon),
    onMutate: async ({ itemId, daChon }) => {
      await queryClient.cancelQueries({ queryKey: khoaChiTiet });
      const truocDo = queryClient.getQueryData<DanhSachDiCho>(khoaChiTiet);
      if (truocDo) {
        queryClient.setQueryData<DanhSachDiCho>(khoaChiTiet, {
          ...truocDo,
          cacMon: truocDo.cacMon.map((mon) => (mon.id === itemId ? { ...mon, daChon } : mon)),
        });
      }
      return { truocDo };
    },
    onError: (_loi, _bien, nguCanh) => {
      if (nguCanh?.truocDo) queryClient.setQueryData(khoaChiTiet, nguCanh.truocDo);
    },
    onSuccess: (duLieu) => queryClient.setQueryData(khoaChiTiet, duLieu),
  });
}
