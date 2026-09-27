import { UserActivityType } from '@prisma/client';
import { jaccardSimilarity } from '@cookbook/shared';

/**
 * FR-RECO-01 - Thuật toán gợi ý dựa trên tương tác.
 * File này chỉ chứa hàm thuần (không I/O) để dễ kiểm thử và tái sử dụng.
 */

/** Trọng số tương tác - spec reco/README.md dòng 14 */
export const ACTIVITY_WEIGHTS: Record<string, number> = {
  FAVORITE: 1.0,
  RATE: 0.8,
  COMMENT: 0.5,
  SHARE: 0.6,
  VIEW: 0.3,
};

/** Danh sách loại tương tác có trọng số, dùng cho truy vấn Prisma */
export const WEIGHTED_ACTIVITY_TYPES = Object.keys(ACTIVITY_WEIGHTS) as UserActivityType[];

/** Nhìn lại 30 ngày - spec reco/README.md dòng 13 */
export const LOOKBACK_DAYS = 30;

/** BR-RECO-01: tối thiểu 3 tương tác mới gợi ý cá nhân hóa được */
export const MIN_INTERACTIONS = 3;

/** BR-RECO-02: cache 1 giờ */
export const CACHE_TTL_MS = 60 * 60 * 1000;

/** BR-RECO-03: không quá 3 món cùng nhóm liên tiếp */
export const MAX_SAME_GROUP_RUN = 3;

/** Kết hợp 60% collaborative + 40% content-based - spec dòng 17 */
export const W_COLLABORATIVE = 0.6;
export const W_CONTENT = 0.4;

export interface ScoredItem {
  key: string;
  collaborative: number;
  content: number;
  group: string;
}

export function activityWeight(type: string): number {
  return ACTIVITY_WEIGHTS[type] ?? 0;
}

/** Chuẩn hoá chuỗi để so khớp không phân biệt hoa/thường, dấu cách, ký tự lạ */
export function normalizeText(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Tách token đã chuẩn hoá, bỏ stopword tiếng Việt phổ biến */
const STOPWORDS = new Set([
  'va', 'cua', 'voi', 'cho', 'tu', 'nhat', 'mot', 'nhung', 'duong', 'trong',
  'the', 'cac', 'de', 'lam', 'nau', 'an', 'thit', 'rau', 'nuoc', 'bot', 'trung',
  'muoi', 'tieu', 'hanh', 'toi', 'khi', 'vao', 'ra', 'bi', 'co', 'khong', 'thuoc',
]);

export function tokenize(input: string): string[] {
  const tokens = normalizeText(input).split(' ').filter(Boolean);
  const meaningful = tokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
  return meaningful.length ? meaningful : tokens;
}

/**
 * Content-based: Jaccard giữa "hồ sơ" món ứng viên và hồ sơ tổng hợp
 * từ các món user đã tương tác.
 */
export function contentScore(candidateTokens: string[], profileTokens: string[]): number {
  if (!candidateTokens.length || !profileTokens.length) return 0;
  return jaccardSimilarity(candidateTokens, profileTokens);
}

/**
 * BR-RECO-03 - Sắp xếp theo điểm rồi phá vỡ "cụm" cùng nhóm.
 * `group` là khoá dùng để kiểm tra BR-RECO-03 (tag/category đầu tiên).
 */
export function applyDiversity<T extends { score: number; group: string }>(items: T[]): T[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const out: T[] = [];
  const deferred: T[] = [];
  let run = 0;
  let lastGroup: string | null = null;

  for (const item of sorted) {
    if (item.group && item.group === lastGroup) {
      run += 1;
    } else {
      run = 1;
      lastGroup = item.group;
    }
    if (run > MAX_SAME_GROUP_RUN) {
      // Trì hoãn thay vì loại bỏ, tránh mất món hợp lệ
      deferred.push(item);
      continue;
    }
    out.push(item);
  }
  // Chèn lại các món bị trì hoãn vào cuối, vẫn giữ thứ tự điểm giảm dần
  return [...out, ...deferred.sort((a, b) => b.score - a.score)];
}

/** Chuẩn hoá score về [0,1] để client hiển thị nhất quán */
export function combinedScore(item: ScoredItem): number {
  return W_COLLABORATIVE * item.collaborative + W_CONTENT * item.content;
}

export function normalizeScores(items: ScoredItem[]): ScoredItem[] {
  if (!items.length) return items;
  const max = Math.max(...items.map(combinedScore));
  if (max <= 0) return items.map((i) => ({ ...i, collaborative: 0, content: 0 }));
  return items.map((i) => ({
    ...i,
    collaborative: round4(i.collaborative / max),
    content: round4(i.content / max),
  }));
}

export function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
