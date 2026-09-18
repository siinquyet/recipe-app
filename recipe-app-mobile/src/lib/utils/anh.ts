import { API_BASE_URL } from '../../constants/cau-hinh';

// BR-UREC: Backend trả đường dẫn tương đối (/uploads/x.jpg) — FE đổi thành tuyệt đối để hiển thị
export function layUrlAnh(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|data:|file:)/i.test(url)) return url;
  const goc = new URL(API_BASE_URL).origin;
  return `${goc}${url.startsWith('/') ? url : `/${url}`}`;
}
