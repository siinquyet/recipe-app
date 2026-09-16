import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const khoaTruyVan = {
  congThuc: {
    danhSach: (thamSo: object) => ['cong-thuc', 'danh-sach', thamSo] as const,
    chiTiet: (id: string) => ['cong-thuc', 'chi-tiet', id] as const,
    tuongTu: (id: string) => ['cong-thuc', 'tuong-tu', id] as const,
  },
  keHoachAn: {
    danhSach: () => ['ke-hoach-an', 'danh-sach'] as const,
    chiTiet: (id: string) => ['ke-hoach-an', 'chi-tiet', id] as const,
  },
  danhSachDiCho: {
    danhSach: () => ['danh-sach-di-cho', 'danh-sach'] as const,
    chiTiet: (id: string) => ['danh-sach-di-cho', 'chi-tiet', id] as const,
  },
  nguoiDung: {
    hoSo: () => ['nguoi-dung', 'ho-so'] as const,
  },
} as const;
