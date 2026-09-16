import { formatVn, parseVn } from '@cook/shared';

export { formatVn, parseVn };

export type DinhDangNgay = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

function layNgayHopLe(dauVao: string | Date): Date | null {
  const ngay = dauVao instanceof Date ? dauVao : new Date(dauVao);
  return Number.isNaN(ngay.getTime()) ? null : ngay;
}

function haiChuSo(giaTri: number): string {
  return String(giaTri).padStart(2, '0');
}

// BR-UI: Người dùng chọn định dạng ngày trong Cài đặt, mặc định DD/MM/YYYY
export function dinhDangNgay(dauVao: string | Date, kieu: DinhDangNgay = 'DD/MM/YYYY'): string {
  const ngay = layNgayHopLe(dauVao);
  if (!ngay) return '';
  const dd = haiChuSo(ngay.getDate());
  const mm = haiChuSo(ngay.getMonth() + 1);
  const yyyy = String(ngay.getFullYear());
  if (kieu === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
  if (kieu === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  return `${dd}/${mm}/${yyyy}`;
}

// BR-UI: DateTime format HH:mm DD/MM/YYYY
export function dinhDangNgayGio(dauVao: string | Date): string {
  const ngay = layNgayHopLe(dauVao);
  if (!ngay) return '';
  return `${haiChuSo(ngay.getHours())}:${haiChuSo(ngay.getMinutes())} ${dinhDangNgay(ngay)}`;
}

// BR-UI: FE tự tính STT, không hiển thị UUID
export function tinhStt(chiSo: number, trang: number, kichThuoc: number): number {
  return chiSo + 1 + trang * kichThuoc;
}
