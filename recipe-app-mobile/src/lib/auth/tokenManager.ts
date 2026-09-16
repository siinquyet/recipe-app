import ky from 'ky';
import { API_BASE_URL, KHOA_LUU_TRU } from '../../constants/cau-hinh';
import type { ApiResponse, DangNhapResponse } from '../../types/api';
import { datMuc, layMuc, xoaMuc } from './khoLuuTru';

export async function luuTokens(accessToken: string, refreshToken: string): Promise<void> {
  await datMuc(KHOA_LUU_TRU.ACCESS_TOKEN, accessToken);
  await datMuc(KHOA_LUU_TRU.REFRESH_TOKEN, refreshToken);
}

export function layAccessToken(): Promise<string | null> {
  return layMuc(KHOA_LUU_TRU.ACCESS_TOKEN);
}

export function layRefreshToken(): Promise<string | null> {
  return layMuc(KHOA_LUU_TRU.REFRESH_TOKEN);
}

export async function xoaTokens(): Promise<void> {
  await xoaMuc(KHOA_LUU_TRU.ACCESS_TOKEN);
  await xoaMuc(KHOA_LUU_TRU.REFRESH_TOKEN);
}

function giaiMaBase64Url(doanMa: string): string {
  const base64 = doanMa.replace(/-/g, '+').replace(/_/g, '/');
  const phanDu = base64.length % 4;
  const buDap = phanDu === 0 ? base64 : base64 + '='.repeat(4 - phanDu);
  return atob(buDap);
}

export function layThoiDiemHetHan(token: string): number | null {
  try {
    const payload = JSON.parse(giaiMaBase64Url(token.split('.')[1] ?? ''));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function tokenHetHan(token: string | null, demTruocMs = 30_000): boolean {
  if (!token) return true;
  const hetHan = layThoiDiemHetHan(token);
  if (hetHan === null) return true;
  return hetHan <= Date.now() + demTruocMs;
}

// BR-AUTH: Dùng ky trần (không interceptor) để tránh đệ quy refresh
export async function lamMoiAccessToken(): Promise<string | null> {
  const refreshToken = await layRefreshToken();
  if (!refreshToken) return null;
  try {
    const ketQua = await ky
      .post(`${API_BASE_URL}auth/refresh`, { json: { refreshToken } })
      .json<ApiResponse<DangNhapResponse>>();
    if (!ketQua.success || !ketQua.data) {
      await xoaTokens();
      return null;
    }
    await luuTokens(ketQua.data.accessToken, ketQua.data.refreshToken);
    return ketQua.data.accessToken;
  } catch {
    await xoaTokens();
    return null;
  }
}
