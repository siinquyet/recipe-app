/**
 * Lop truy van nguoi dung cho trang quan tri (FR-ADM-01).
 *
 * Tach rieng khoi component de logic thuan (dung tham so, quy tac khoa tai
 * khoan) test duoc ma khong can render DOM, va co MOT noi duy nhat biet backend
 * chap nhan tham so gi.
 *
 * Backend: `AdminUserQueryDto` (modules/admin/dto/admin-query.dto.ts) - chi nhan
 * `page`, `size` (1..50), `search` (khop `email` + `displayName`). KHONG co
 * `status` va KHONG co `sortBy`; gui tham so ngoai danh sach nay bi
 * `forbidNonWhitelisted` tra 400.
 */
import { apiClient } from '../../api/client';

// --- Kieu du lieu, phai khop voi response cua backend -------------------------

/** `UserStatusDto` chi chap nhan hai gia tri nay (backend `ADM-01`). */
export const USER_STATUSES = ['ACTIVE', 'BANNED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** Backend luon kem `_count` san trong `select` cua `findAllUsers`. */
  _count: { recipes: number; comments: number; favorites: number };
}

export interface Paged<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
}

// --- Tham so truy van ---------------------------------------------------------

/** Khop voi `@Max(50)` cua `AdminUserQueryDto.size`. */
export const USER_MAX_PAGE_SIZE = 50;
export const USER_PAGE_SIZE = 10;

export interface UserListQuery {
  page?: number;
  size?: number;
  search?: string;
}

export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === 'string' && (USER_STATUSES as readonly string[]).includes(value);
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

function normalizePage(page: number | undefined): number {
  if (typeof page !== 'number' || !Number.isFinite(page) || page < 0) return 0;
  return Math.floor(page);
}

function normalizeSize(size: number | undefined): number {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 1) return USER_PAGE_SIZE;
  return Math.min(Math.floor(size), USER_MAX_PAGE_SIZE);
}

/**
 * Dung `URLSearchParams` de tham so co dau `@` (email) hay dau cach trong
 * `search` khong lam hong URL.
 */
export function buildUserListParams(query: UserListQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', String(normalizePage(query.page)));
  params.set('size', String(normalizeSize(query.size)));

  const search = query.search?.trim();
  if (search) params.set('search', search);

  return params;
}

// --- Quy tac khoa tai khoan (FR-ADM-01) ---------------------------------------

export type UserAction = 'ban' | 'unban';

/**
 * Cac thao tac backend cho phep theo vai tro va trang thai hien tai.
 *
 * Sao chep dieu kien trong `admin.service.ts` de UI khong bao gio hien nut
 * cham vo toi API 409: `changeUserStatus` tra `409 [ADM-04] Khong the khoa tai
 * khoan ADMIN` cho **moi** trang thai moi, khi `user.role === 'ADMIN'` -
 * ke ca lenh mo khoa. Nen tai khoan ADMIN khong co nut nao ca hai huong.
 *
 * Backend khong co endpoint doi vai tro nen khong sinh action cho `role`.
 */
export function allowedUserActions(
  user: { role?: string | null; status?: string | null } | null | undefined,
): UserAction[] {
  if (!user) return [];

  // Thieu `role` thi KHONG doan. `role` la cong phan quyen: khong biet chac
  // day khong phai ADMIN thi khong duoc dua ra hanh dong pha huy tai khoan.
  // Response that luon co `role` (nam trong `select` cua `findAllUsers`), nen
  // truong hop `undefined` chi la du lieu hong - an nut an toan hon hien nut
  // cham 409, va hop chi tiet ghi ro ly do cho quan tri vien.
  const role = String(user.role ?? '').trim().toUpperCase();
  if (!isUserRole(role)) return [];

  // `ADM-04`: chan **ca hai** huong, ke ca lenh mo khoa mot tai khoan ADMIN da
  // bi khoa tay (chi sua duoc bang truc tiep vao DB). Dien canh 409 chon moi
  // thao tac, nen tao khoan ADMIN khong co nut nao.
  if (role === 'ADMIN') return [];

  // Thieu `status` thi van hanh dong duoc: `changeUserStatus` gan thang
  // (`data: { status: dto.status }`) ma khong doc trang thai hien tai, nen PATCH
  // `BANNED` luon hop le du tai khoan dang o trang thai gi. Mac dinh coi nhu
  // chua khoa va hien nut "Khoa" - dung hon la hien "Mo khoa" khi khong biet.
  if (String(user.status ?? '').trim().toUpperCase() === 'BANNED') return ['unban'];
  return ['ban'];
}

/** Trang thai sau khi bam nut, de goi API. */
export function nextStatus(action: UserAction): UserStatus {
  return action === 'ban' ? 'BANNED' : 'ACTIVE';
}

export const USER_ACTION_LABEL: Record<UserAction, string> = {
  ban: 'Khóa',
  unban: 'Mở khóa',
};

export const USER_ACTION_TITLE: Record<UserAction, string> = {
  ban: 'Khóa tài khoản',
  unban: 'Mở khóa tài khoản',
};

const FALLBACK: Record<UserAction, string> = {
  ban: 'Khóa tài khoản thất bại',
  unban: 'Mở khóa tài khoản thất bại',
};

/** Thong diep loi khi backend khong tra `message` (mang, timeout, ...). */
export function userActionFallback(action: UserAction): string {
  return FALLBACK[action];
}

// --- Ngay theo dinh dang Viet -------------------------------------------------

/**
 * Ngay theo dinh dang Viet; tra chuoi rong thay vi `Invalid Date` khi du lieu
 * sai - `Invalid Date` lo ra giua bang, quan tri vien tuong la dong do la loi
 * hien thi cua trang.
 */
export function formatUserDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
}

export function formatUserDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('vi-VN');
}

/**
 * Nhan cua trang thai tai khoan.
 *
 * `statusMeta.ts` da co san `BANNED -> "Đa khoa"`; `ACTIVE` thi dung cho ca
 * `ReferenceStatus` nen nhan "Đang hoạt động` cho tham chieu cua cong thuc la
 * mo ta trang thai, khong phai tai khoan. O day tra nhan rieng cho nguoi dung.
 *
 * Gia tri lạ thi giu nguyen chuoi goc: `User.status` la **String** trong
 * schema nen "du lieu sai" la cau tra loi nhe hon "nhan rong ma khong ro
 * dang gi".
 */
export function userStatusLabel(status: string | null | undefined): string {
  if (!status) return '';
  const key = String(status).trim().toUpperCase();
  if (key === 'ACTIVE') return 'Hoạt động';
  if (key === 'BANNED') return 'Đã khóa';
  return String(status);
}

/** Nhan cua vai tro. */
export function userRoleLabel(role: string | null | undefined): string {
  if (!role) return '';
  const key = String(role).trim().toUpperCase();
  if (key === 'ADMIN') return 'Quản trị viên';
  if (key === 'USER') return 'Người dùng';
  return String(role);
}

// --- React Query keys ---------------------------------------------------------

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (query: UserListQuery) => [...userKeys.lists(), query] as const,
};

// --- Lop goi API --------------------------------------------------------------

export async function fetchUsers(query: UserListQuery = {}): Promise<Paged<AdminUser>> {
  const params = buildUserListParams(query);
  const res = await apiClient.get(`/admin/users?${params.toString()}`);
  return res.data as Paged<AdminUser>;
}

/** FR-ADM-01. `ADM-04` neu tài khoản la ADMIN; `ADM-01` neu status sai. */
export async function changeUserStatus(id: string, status: UserStatus) {
  const res = await apiClient.patch(`/admin/users/${id}/status`, { status });
  return res.data;
}
