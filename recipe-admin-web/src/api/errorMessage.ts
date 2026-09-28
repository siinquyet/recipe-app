/**
 * Lay thong bao loi tieng Viet tu response cua backend.
 *
 * Backend tra `{ message: string | string[] }` voi ma loi theo dang
 * `[MODULE-XX] Mo ta`. React Query / axios nem loi len cao hon, nen moi noi
 * phai boc mot lan: trich ra `message` va noi phai la string.
 */
export function extractApiMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const data = (err as { response?: { data?: { message?: unknown } } }).response?.data;
    const msg = data?.message;
    if (typeof msg === 'string' && msg.trim() !== '') return msg;
    // class-validator tra mot danh sach loi khi DTO sai
    if (Array.isArray(msg) && msg.length > 0) {
      const first = msg.find((m) => typeof m === 'string' && m.trim() !== '');
      if (typeof first === 'string') return first;
    }
  }
  return fallback;
}
