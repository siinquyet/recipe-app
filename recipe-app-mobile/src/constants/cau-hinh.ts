export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1/';

export const KICH_THUOC_TRANG_MAC_DINH = 10;
export const KICH_THUOC_TRANG_TOI_DA = 50;

export const KHOA_LUU_TRU = {
  ACCESS_TOKEN: 'cook.accessToken',
  REFRESH_TOKEN: 'cook.refreshToken',
} as const;

// BR-UI: Màu dùng cho prop color của icon (native prop, không dùng được class Tailwind)
export const MAU_SAC = {
  MUTED: '#97A2B0',
  SAO: '#FFC107',
  MUC: '#0A2533',
  TEAL: '#70B9BE',
} as const;
