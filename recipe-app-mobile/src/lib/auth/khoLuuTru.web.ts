// BR-AUTH: Web không có SecureStore mã hóa — dùng localStorage (không mã hóa).
// Metro tự chọn file .web.ts khi bundle cho web nên expo-secure-store không bị import.
export async function datMuc(khoa: string, giaTri: string): Promise<void> {
  localStorage.setItem(khoa, giaTri);
}

export async function layMuc(khoa: string): Promise<string | null> {
  return localStorage.getItem(khoa);
}

export async function xoaMuc(khoa: string): Promise<void> {
  localStorage.removeItem(khoa);
}
