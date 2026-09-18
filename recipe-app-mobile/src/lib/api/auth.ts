import type { ApiResponse, DangNhapResponse, NguoiDung } from '../../types/api';
import { apiClient, goiApi } from './client';
import { dangNhapResponseSchema, nguoiDungSchema } from './schemas';

export interface DangKyPayload {
  email: string;
  matKhau: string;
  tenHienThi: string;
}

export interface DangNhapPayload {
  email: string;
  matKhau: string;
}

export async function dangKy(payload: DangKyPayload): Promise<DangNhapResponse> {
  const duLieu = await goiApi(
    apiClient.post('auth/register', { json: payload }).json<ApiResponse<DangNhapResponse>>(),
  );
  return dangNhapResponseSchema.parse(duLieu);
}

export async function dangNhap(payload: DangNhapPayload): Promise<DangNhapResponse> {
  const duLieu = await goiApi(
    apiClient.post('auth/login', { json: payload }).json<ApiResponse<DangNhapResponse>>(),
  );
  return dangNhapResponseSchema.parse(duLieu);
}

export async function layThongTinNguoiDung(): Promise<NguoiDung> {
  const duLieu = await goiApi(apiClient.get('auth/me').json<ApiResponse<NguoiDung>>());
  return nguoiDungSchema.parse(duLieu);
}

// BR-AUTH: Quên mật khẩu — backend luôn trả lời chung để chống dò email
export async function quenMatKhau(email: string): Promise<void> {
  await goiApi(apiClient.post('auth/forgot-password', { json: { email } }).json<ApiResponse<unknown>>());
}
