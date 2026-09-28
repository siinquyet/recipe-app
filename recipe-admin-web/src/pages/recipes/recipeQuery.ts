/**
 * Lop truy van cong thuc cho trang quan tri (FR-ADM-02, FR-ADM-03).
 *
 * Tach rieng khoi component de:
 * - logic thuan (kiem tra trang thai, dung tham so, quy tac BR-02) test duoc
 *   ma khong can render DOM,
 * - co MOT noi duy nhat biet backend chap nhan tham so gi va quy tac gi,
 *   thay vi moi page tu doi lai mot lan.
 *
 * Backend: `RecipeQueryDto` (modules/recipes/dto/recipe-query.dto.ts) - chi nhan
 * `page`, `size` (1..50), `search`, `status`, `categoryId`, `tagNames`,
 * `sortBy` (createdAt|title|updatedAt), `sortDirection` (asc|desc). Gui tham so
 * ngoai danh sach nay se bi `[REC-05]` tra ve 400.
 */
import { apiClient } from '../../api/client';
import { resolveStatus } from '../../components/ui/statusMeta';

// --- Kieu du lieu, phai khop voi response cua backend -------------------------

export const RECIPE_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'HIDDEN',
] as const;

export type RecipeStatus = (typeof RECIPE_STATUSES)[number];

export const RECIPE_SORT_FIELDS = ['createdAt', 'title', 'updatedAt'] as const;
export type RecipeSortField = (typeof RECIPE_SORT_FIELDS)[number];
export type SortDirection = 'asc' | 'desc';

export interface RecipeAuthor {
  displayName: string;
  email: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  cookTimeMinutes: number | null;
  prepTimeMinutes: number | null;
  servings: number | null;
  status: string;
  source: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  /** Chi co khi goi `/recipes` voi token ADMIN; USER thi khong thay. */
  author?: RecipeAuthor | null;
}

export interface RecipeIngredient {
  id: string;
  originalText: string;
  quantity: string | null;
  unit: string | null;
  sortOrder: number;
  internalIngredient?: { canonicalName: string } | null;
}

export interface RecipeStep {
  id: string;
  stepOrder: number;
  content: string;
  imageUrl: string | null;
}

export interface RecipeNutrition {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface RecipeDetail extends RecipeSummary {
  authorId: string;
  externalId: string | null;
  categoryId: string | null;
  deletedAt: string | null;
  category?: { name: string; slug: string } | null;
  tags?: { name: string }[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition: RecipeNutrition | null;
}

export interface Paged<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
}

// --- Tham so truy van ---------------------------------------------------------

/** Khop voi `@Max(50)` cua `RecipeQueryDto.size`. */
export const RECIPE_MAX_PAGE_SIZE = 50;
/** Mac dinh cua trang quan tri: 10 dong, doc duoc ma khong phai can keo. */
export const RECIPE_PAGE_SIZE = 10;

export interface RecipeListQuery {
  page?: number;
  size?: number;
  /** Chuoi rong = khong loc theo trang thai. */
  status?: string;
  search?: string;
  sortBy?: RecipeSortField;
  sortDirection?: SortDirection;
}

export function isRecipeStatus(value: unknown): value is RecipeStatus {
  return typeof value === 'string' && (RECIPE_STATUSES as readonly string[]).includes(value);
}

export function isRecipeSortField(value: unknown): value is RecipeSortField {
  return typeof value === 'string' && (RECIPE_SORT_FIELDS as readonly string[]).includes(value);
}

/**
 * Chuoi trang thai ma UI duoc phep gui.
 *
 * Dung cho cac muc cua `select` / `tabs`: gia tri lai den tu ngoai (vi du tu
 * query string) thi phai kiem tra truoc, nen bo qua gia tri khong hop le thay
 * vi gui len de backend tra `[REC-05]`.
 */
export function sanitizeStatus(status: string | undefined): RecipeStatus | '' {
  if (!status) return '';
  const up = status.trim().toUpperCase();
  return isRecipeStatus(up) ? up : '';
}

function normalizePage(page: number | undefined): number {
  if (typeof page !== 'number' || !Number.isFinite(page) || page < 0) return 0;
  return Math.floor(page);
}

function normalizeSize(size: number | undefined): number {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 1) return RECIPE_PAGE_SIZE;
  return Math.min(Math.floor(size), RECIPE_MAX_PAGE_SIZE);
}

/**
 * Dung `URLSearchParams` de tham so co gia tri rong / dau cach / dau `&` trong
 * `search` khong lam hong URL.
 */
export function buildRecipeListParams(query: RecipeListQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(normalizePage(query.page)));
  params.set('size', String(normalizeSize(query.size)));

  const status = sanitizeStatus(query.status);
  if (status) params.set('status', status);

  const search = query.search?.trim();
  if (search) params.set('search', search);

  // Khong gui `sortBy` khi nguoi dung chua chon: de backend dung mac dinh
  // (`createdAt` desc) thay vi gan gia tri o day va lo du lieu khi backend doi.
  if (isRecipeSortField(query.sortBy)) {
    params.set('sortBy', query.sortBy);
    params.set('sortDirection', query.sortDirection === 'asc' ? 'asc' : 'desc');
  }

  return params;
}

// --- Quy tac BR-02: thao tac nao hop le o trang thai nao -----------------------

export type ModerationAction = 'approve' | 'reject' | 'hide';

/**
 * Cac thao tac backend cho phep theo trang thai hien tai.
 *
 * Sao chep dung dieu kien trong `admin.service.ts` de UI khong bao gio hien
 * nut cham vo toi API 409:
 * - `approve` / `reject`: chi PENDING, sai thi `[ADM-05]`
 * - `hide`: chi APPROVED hoac REJECTED, sai thi `[ADM-06]`
 *
 * `HIDDEN` khong co hanh dong nao: backend **khong co** endpoint `unhide`, nen
 * khong ve "Khoi phuc" o day.
 */
export function allowedActions(status: string | null | undefined): ModerationAction[] {
  switch (String(status ?? '').toUpperCase()) {
    case 'PENDING':
      return ['approve', 'reject'];
    case 'APPROVED':
    case 'REJECTED':
      return ['hide'];
    default:
      return [];
  }
}

// --- Kiem tra ly do tu choi ---------------------------------------------------

/** `@MaxLength(500)` cua `ModeratorActionDto`. */
export const REJECT_REASON_MAX = 500;
/** `@MinLength(5)` cua `ModeratorActionDto`. */
export const REJECT_REASON_MIN = 5;

/**
 * Kiem tra ly do tu choi theo dung gioi han backend.
 *
 * BR-02 yeu cau bat buoc co ly do, con DTO backend la `@IsOptional()` nen
 * bo qua truong thi van qua duoc - do la xung dot giua spec va hien thuc, da
 * ghi o DEFER-09. Web admin chon theo BR-02: bat buoc nhap, va giu nguyen
 * **nguyen van ban** ma loi de thong bao cua hai ben giong het nhau.
 *
 * @return Chuoi loi, hoac `null` neu hop le.
 */
export function validateRejectReason(reason: string): string | null {
  const value = reason.trim();
  if (value === '') return '[ADM-02] Lý do từ chối là bắt buộc';
  if (value.length < REJECT_REASON_MIN) {
    return `[ADM-02] Lý do tối thiểu ${REJECT_REASON_MIN} ký tự`;
  }
  if (value.length > REJECT_REASON_MAX) {
    return `[ADM-02] Lý do tối đa ${REJECT_REASON_MAX} ký tự`;
  }
  return null;
}

// --- Nhan hien thi ------------------------------------------------------------

/**
 * Ngay theo dinh dang Viet.
 *
 * Tra chuoi rong thay vi `Invalid Date` khi du lieu sai - `Invalid Date` lo ra
 * giua bang, quan tri vien tuong la dong do la loi hien thi cua trang.
 */
export function formatDateVi(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
}

export function formatDateTimeVi(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('vi-VN');
}

/**
 * Nhan cua muc loc theo trang thai.
 *
 * `''` la "Tat ca" - khong phai mot trang thai nen khong nam trong `statusMeta`.
 * Cac nhan con lai lay tu `statusMeta.ts` de khong ton tai hai noi doi ten trang
 * thai (dung o day truoc do la nguon goc cua su trung lap mau sac).
 */
export function tabLabel(status: RecipeStatus | ''): string {
  return status === '' ? 'Tất cả' : resolveStatus(status).label;
}

/** Thu tu hien thi cac muc loc, theo muc do quan trong cua quan tri vien. */
export const RECIPE_TAB_ORDER: (RecipeStatus | '')[] = [
  '',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'HIDDEN',
  'DRAFT',
];

// --- React Query keys ---------------------------------------------------------

export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (query: RecipeListQuery) => [...recipeKeys.lists(), query] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
};

// --- Lop goi API --------------------------------------------------------------

export async function fetchRecipes(query: RecipeListQuery = {}): Promise<Paged<RecipeSummary>> {
  const params = buildRecipeListParams(query);
  const res = await apiClient.get(`/recipes?${params.toString()}`);
  return res.data as Paged<RecipeSummary>;
}

export async function fetchRecipeDetail(id: string): Promise<RecipeDetail> {
  const res = await apiClient.get(`/recipes/${id}`);
  return res.data as RecipeDetail;
}

/** BR-02: PENDING -> APPROVED. Sai trang thai se tra `[ADM-05]`. */
export async function approveRecipe(id: string) {
  const res = await apiClient.patch(`/admin/recipes/${id}/approve`);
  return res.data;
}

/** BR-02: PENDING -> REJECTED kem `rejectionReason`. Sai trang thai -> `[ADM-05]`. */
export async function rejectRecipe(id: string, reason: string) {
  const res = await apiClient.patch(`/admin/recipes/${id}/reject`, { reason: reason.trim() });
  return res.data;
}

/** BR-02: APPROVED|REJECTED -> HIDDEN. Sai trang thai se tra `[ADM-06]`. */
export async function hideRecipe(id: string) {
  const res = await apiClient.patch(`/admin/recipes/${id}/hide`);
  return res.data;
}
