/**
 * Lop truy van Recipe Reference cho trang quan tri (FR-ADM-04).
 *
 * Tach rieng khoi component de logic thuan (dung tham so, trang thai dong bo,
 * dinh dang diem) test duoc ma khong can DOM.
 *
 * Backend: `RecipeReferenceQueryDto` (dto/recipe-reference-query.dto.ts) nhan
 * `page`, `size` (1..50), `search` (khop `title`), `status` (ACTIVE|UNAVAILABLE),
 * `source` (SPOONACULAR), `sort`. Gui tham so ngoai danh sach bi 400
 * (`forbidNonWhitelisted` - da kiem chung tren API that). `sort` rong gia tri
 * (vd `foo:desc`) bi DB bao loi 500 nen khong dung sap xep tuy y.
 *
 * KHONG co endpoint sync nao (ca `/admin/references/sync` lan
 * `/recipe-references/*` deu chi co GET) - DEFER-13. Vi vay trang nay KHONG co
 * nut "Sync now" (backend khong co API de goi), khong co cot Actions.
 */
import { apiClient } from '../../api/client';
import { formatVn } from '@shared/number';

// --- Kieu du lieu, khop voi response cua backend ------------------------------

/** `RecipeReferenceQueryDto.status` chi nhan hai gia tri nay. */
export const REFERENCE_STATUSES = ['ACTIVE', 'UNAVAILABLE'] as const;
export type ReferenceStatus = (typeof REFERENCE_STATUSES)[number];

export const REFERENCE_SOURCES = ['SPOONACULAR'] as const;
export type ReferenceSource = (typeof REFERENCE_SOURCES)[number];

export interface RecipeReference {
  id: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl: string | null;
  servings: number;
  status: string;
  spoonacularScore: number | null;
  healthScore: number | null;
  aggregateLikes: number | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferencePage {
  content: RecipeReference[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
}

// --- Tham so truy van ---------------------------------------------------------

/** Khop voi `@Max(50)` cua `RecipeReferenceQueryDto.size`. */
export const REFERENCE_MAX_PAGE_SIZE = 50;
export const REFERENCE_PAGE_SIZE = 10;

export interface ReferenceListQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export function isReferenceStatus(value: unknown): value is ReferenceStatus {
  return typeof value === 'string' && (REFERENCE_STATUSES as readonly string[]).includes(value);
}

function normalizePage(page: number | undefined): number {
  if (typeof page !== 'number' || !Number.isFinite(page) || page < 0) return 0;
  return Math.floor(page);
}

function normalizeSize(size: number | undefined): number {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 1) return REFERENCE_PAGE_SIZE;
  return Math.min(Math.floor(size), REFERENCE_MAX_PAGE_SIZE);
}

/**
 * Dung `URLSearchParams` de tham so co dau cach trong `search` khong lam hong URL.
 */
export function buildReferenceListParams(query: ReferenceListQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(normalizePage(query.page)));
  params.set('size', String(normalizeSize(query.size)));

  const search = query.search?.trim();
  if (search) params.set('search', search);

  // Chi gui `status` khi hop le: backend `@IsEnum` tra 400 cho gia tri la.
  if (isReferenceStatus(query.status)) params.set('status', query.status);

  return params;
}

// --- Trang thai dong bo ---------------------------------------------------------

export interface SyncState {
  label: string;
  tone: 'green' | 'gray';
  /** Chuoi ISO goc de hien thi ngay gio gan ben canh badge. */
  syncedAt: string | null;
}

/**
 * Trang thai dong bo cua mot reference.
 *
 * `lastSyncedAt` null / sai dinh dang => "Chu dong bo" (xam), khong bao gio
 * de "Invalid Date" lo ra giua bang.
 */
export function referenceSyncState(iso: string | null | undefined): SyncState {
  if (!iso) return { label: 'Chưa đồng bộ', tone: 'gray', syncedAt: null };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: 'Chưa đồng bộ', tone: 'gray', syncedAt: null };
  return { label: 'Đã đồng bộ', tone: 'green', syncedAt: iso };
}

// --- Dinh dang ngay / diem ------------------------------------------------------

/** Ngay gio theo dinh dang Viet; tra rong thay vi "Invalid Date" khi du lieu sai. */
export function formatReferenceDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('vi-VN');
}

/**
 * Gom 3 chi so (Spoonacular / Health / Likes) thanh mot chuoi de hien trong
 * cot "Diem". Ca 3 deu null thi tra null (hien thi gach ngang).
 */
export function formatReferenceScores(ref: {
  spoonacularScore: number | null | undefined;
  healthScore: number | null | undefined;
  aggregateLikes: number | null | undefined;
}): string | null {
  const { spoonacularScore, healthScore, aggregateLikes } = ref;
  if (spoonacularScore == null && healthScore == null && aggregateLikes == null) return null;
  return [spoonacularScore, healthScore, aggregateLikes].map((v) => formatVn(v ?? 0)).join(' / ');
}

// --- React Query keys ---------------------------------------------------------

export const referenceKeys = {
  all: ['references'] as const,
  lists: () => [...referenceKeys.all, 'list'] as const,
  list: (query: ReferenceListQuery) => [...referenceKeys.lists(), query] as const,
};

// --- Lop goi API ---------------------------------------------------------------

export async function fetchReferences(query: ReferenceListQuery = {}): Promise<ReferencePage> {
  const params = buildReferenceListParams(query);
  const res = await apiClient.get(`/recipe-references?${params.toString()}`);
  return res.data as ReferencePage;
}