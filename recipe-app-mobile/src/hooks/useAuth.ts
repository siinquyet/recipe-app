import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dangKy, dangNhap, layThongTinNguoiDung } from '../lib/api/auth';
import type { DangKyPayload, DangNhapPayload } from '../lib/api/auth';
import { luuTokens, xoaTokens } from '../lib/auth/tokenManager';
import { khoaTruyVan, queryClient } from '../lib/queryClient';
import { useAuthStore } from '../stores/authStore';

export function useHoSoNguoiDung(dangNhapRoi: boolean) {
  return useQuery({
    queryKey: khoaTruyVan.nguoiDung.hoSo(),
    queryFn: layThongTinNguoiDung,
    enabled: dangNhapRoi,
  });
}

export function useDangNhap() {
  const datNguoiDung = useAuthStore((s) => s.datNguoiDung);
  return useMutation({
    mutationFn: (payload: DangNhapPayload) => dangNhap(payload),
    onSuccess: async (tokens) => {
      await luuTokens(tokens.accessToken, tokens.refreshToken);
      const nguoiDung = await layThongTinNguoiDung();
      datNguoiDung(nguoiDung);
    },
  });
}

export function useDangKy() {
  const datNguoiDung = useAuthStore((s) => s.datNguoiDung);
  return useMutation({
    mutationFn: (payload: DangKyPayload) => dangKy(payload),
    onSuccess: async (tokens) => {
      await luuTokens(tokens.accessToken, tokens.refreshToken);
      const nguoiDung = await layThongTinNguoiDung();
      datNguoiDung(nguoiDung);
    },
  });
}

export function useDangXuat() {
  const queryClientLocal = useQueryClient();
  const datNguoiDung = useAuthStore((s) => s.datNguoiDung);
  return useMutation({
    mutationFn: () => xoaTokens(),
    onSuccess: () => {
      datNguoiDung(null);
      queryClientLocal.clear();
      queryClient.clear();
    },
  });
}
