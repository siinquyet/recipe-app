/**
 * Lop truy van Analytics Dashboard cho trang quan tri (FR-ADM-05).
 *
 * Tach rieng khoi component de logic thuan (tham so days, chuan hoa toa do
 * chart, dinh dang ngay truc X) test duoc ma khong can DOM.
 *
 * Backend: `GET /admin/analytics/dashboard?days=7|30|90` (mac dinh 7) - khi
 * truyen days ngoai danh sach thi service tu ha ve 7 (`AnalyticsService`).
 * Tra ve totalUsers, activeUsers, publishedRecipes, topRatedRecipes (BR-05:
 * chi mon co >= 5 danh gia), usersGrowth, recipesGrowth, engagement.
 *
 * Chart ve bang SVG thuan (KHONG dung recharts - rat re cai them khi clone
 * dang track node_modules/lockfile, user chot 2026-09-28): `chartCoords` /
 * `barChunks` tra toa do chuan hoa de component va test cung nhin mot cong
 * thuc duy nhat.
 */
import { apiClient } from '../../api/client';

// --- Kieu du lieu, khop voi response cua backend ------------------------------

/** `AnalyticsQueryDto` chi nhan 7 / 30 / 90. */
export const ANALYTICS_DAYS = [7, 30, 90] as const;
export type AnalyticsDays = (typeof ANALYTICS_DAYS)[number];

export interface GrowthPoint {
  date: string;
  newUsers?: number;
  newRecipes?: number;
}

export interface TopRatedRecipe {
  id: string;
  title: string;
  averageRating: number;
  totalRatings: number;
}

export interface DashboardData {
  rangeDays: number;
  totalUsers: number;
  activeUsers: number;
  publishedRecipes: number;
  topRatedRecipes: TopRatedRecipe[];
  usersGrowth: GrowthPoint[];
  recipesGrowth: GrowthPoint[];
  engagement: { totalFavorites: number; totalRatings: number; totalComments: number };
}

// --- Tham so truy van ---------------------------------------------------------

export function isAnalyticsDays(value: unknown): value is AnalyticsDays {
  return (
    typeof value === 'number' &&
    (ANALYTICS_DAYS as readonly number[]).includes(value)
  );
}

/** Chi gui days hop le; gia tri la -> 7 (backend cung tu ha ve 7). */
export function buildAnalyticsParams(days: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set('days', String(isAnalyticsDays(days) ? days : 7));
  return params;
}

// --- Dinh dang ngay truc X ------------------------------------------------------

/** '2026-08-19' -> '19/8' (bo nam de truc X bop lai). Sai thi giu nguyen. */
export function formatChartDate(dateKey: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey ?? '');
  if (!m) return dateKey;
  return `${Number(m[3])}/${Number(m[2])}`;
}

// --- Chuan hoa toa do chart (SVG thuan) ----------------------------------------

export interface Vec2 {
  x: number;
  y: number;
}

export interface BarRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Toa do pixel cho tung diem cua line chart (viewBox width x height, lề pad).
 *
 * Truc Y cua SVG huong xuong: gia tri lon -> y nho (diem o tren cao). Toan 0
 * thi nam o day (max roi ve 1 de khong chia cho 0).
 */
export function chartCoords(
  values: readonly number[],
  width: number,
  height: number,
  pad = 4,
): Vec2[] {
  if (values.length === 0) return [];
  const max = Math.max(...values, 0) || 1;
  const usableW = Math.max(width - pad * 2, 1);
  const usableH = Math.max(height - pad * 2, 1);

  if (values.length === 1) {
    return [{ x: width / 2, y: height - pad - (Math.max(values[0], 0) / max) * usableH }];
  }

  return values.map((v, i) => ({
    x: pad + (i * usableW) / (values.length - 1),
    y: height - pad - (Math.max(v, 0) / max) * usableH,
  }));
}

/** '3,46 53,4' - attribute `points` cua <polyline>. */
export function toPolylinePoints(coords: readonly Vec2[]): string {
  return coords.map((c) => `${c.x},${c.y}`).join(' ');
}

/**
 * Toa do cac cot cua bar chart: cot cao ung voi gia tri lon (y nho), width
 * = 50% slot de co khoang cach giua cac cot.
 */
export function barChunks(
  values: readonly number[],
  width: number,
  height: number,
  pad = 4,
): BarRect[] {
  const n = values.length;
  if (n === 0) return [];
  const max = Math.max(...values, 0) || 1;
  const usableH = Math.max(height - pad * 2, 0);
  const slot = width / n;
  const w = Math.max(slot * 0.5, 1);

  return values.map((v, i) => {
    const h = (Math.max(v, 0) / max) * usableH;
    return { x: i * slot + (slot - w) / 2, y: height - pad - h, w, h };
  });
}

// --- React Query keys ---------------------------------------------------------

export const dashboardKeys = {
  all: ['analytics'] as const,
  detail: (days: number) => [...dashboardKeys.all, days] as const,
};

// --- Lop goi API ---------------------------------------------------------------

export async function fetchDashboard(days: number = 7): Promise<DashboardData> {
  const params = buildAnalyticsParams(days);
  const res = await apiClient.get(`/admin/analytics/dashboard?${params.toString()}`);
  return res.data as DashboardData;
}