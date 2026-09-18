import { userApiClient } from './userClient';

// BR-UREC: Upload ảnh món ăn (POST /uploads, field `file`, cần đăng nhập)
export async function taiAnhLen(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await userApiClient.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const body = res.data as { success: boolean; data: { url: string }; error: { code: string; message: string } | null };
  if (!body.success) throw new Error(`[${body.error?.code ?? 'UP-00'}] ${body.error?.message ?? 'Không tải ảnh được'}`);
  return body.data.url;
}
