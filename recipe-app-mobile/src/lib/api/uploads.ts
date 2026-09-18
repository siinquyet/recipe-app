import { z } from 'zod';
import { API_BASE_URL } from '../../constants/cau-hinh';
import { layAccessToken } from '../auth/tokenManager';
import { ApiError } from './client';

const taiAnhResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({ url: z.string() }).nullable(),
  error: z.object({ code: z.string(), message: z.string() }).nullable(),
});

function doanDinhDang(uri: string): { ten: string; loai: string } {
  const duoi = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const loai = duoi === 'png' ? 'image/png' : duoi === 'webp' ? 'image/webp' : 'image/jpeg';
  return { ten: `anh-${Date.now()}.${duoi}`, loai };
}

// BR-UREC: Upload ảnh món ăn lên POST /uploads, trả về đường dẫn lưu DB.
// Dùng fetch trực tiếp thay vì ky vì ky serialize multipart FormData kém ổn định.
export async function taiAnhLen(fileUri: string): Promise<string> {
  try {
    const phanHoi = await fetch(fileUri);
    const duLieuAnh = await phanHoi.blob();
    const { ten, loai } = doanDinhDang(fileUri);

    const bieuMau = new FormData();
    bieuMau.append('file', new Blob([duLieuAnh], { type: loai }), ten);

    const token = await layAccessToken();
    const traLoi = await fetch(`${API_BASE_URL}uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: bieuMau,
    });
    const body = taiAnhResponseSchema.parse(await traLoi.json());
    if (!body.success || !body.data) {
      throw new ApiError(body.error?.code ?? 'UP-00', body.error?.message ?? 'Tải ảnh thất bại');
    }
    return body.data.url;
  } catch (loi) {
    if (loi instanceof ApiError) throw loi;
    throw new ApiError('NETWORK', 'Không thể kết nối máy chủ');
  }
}
