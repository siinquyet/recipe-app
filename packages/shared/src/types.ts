/**
 * Shared TypeScript types for Cook monorepo
 * Generated from OpenAPI spec (docs/api/openapi.yaml)
 * Used by: recipe-admin-web, recipe-backend-api
 * Android uses Kotlin equivalent generated from same OpenAPI spec
 */

// ============================================
// Base Types
// ============================================

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort?: string;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// ============================================
// Auth Types
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserRole = 'USER' | 'ADMIN';

// ============================================
// User Types
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'ACTIVE' | 'BANNED';
  recipeCount: number;
  createdAt: string; // ISO 8601
}

export interface UserPreferences {
  id: string;
  dietaryTags: string[]; // vegetarian, vegan, gluten-free, keto, etc.
  allergies: string[];
  cuisinePrefs: string[];
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdatePreferencesRequest {
  dietaryTags?: string[];
  allergies?: string[];
  cuisinePrefs?: string[];
}

// ============================================
// Category/Tag Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface CreateTagRequest {
  name: string;
  slug: string;
}

// ============================================
// Recipe Types (List - NO ID per UI rules)
// ============================================

/**
 * Recipe list item - KHÔNG CÓ id
 * STT được tính bởi FE: index + 1 + page * size
 */
export interface RecipeListItem {
  title: string;
  thumbnailUrl?: string;
  cookTimeMinutes: number;
  servings: number;
  authorName: string;
  authorAvatarUrl?: string;
  createdAt: string; // ISO 8601
}

/**
 * Recipe detail - CÓ id nội bộ nhưng FE KHÔNG hiển thị
 */
export interface RecipeDetail {
  id: string; // INTERNAL ONLY - never display in UI
  title: string;
  description?: string;
  thumbnailUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  author: UserProfile;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition?: NutritionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: string; // Already formatted VN: "1.000", "500"
  unit: string;
}

export interface RecipeIngredientCreate {
  name: string;
  quantity: number; // Raw number, BE formats
  unit: string;
  sortOrder: number;
}

export interface RecipeStep {
  stepOrder: number;
  content: string;
  imageUrl?: string;
}

export interface RecipeStepCreate {
  stepOrder: number;
  content: string;
  imageUrl?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string; // Formatted VN
  carbs: string;
  fat: string;
}

export interface NutritionInfoCreate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeCreateRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  cookTimeMinutes: number;
  prepTimeMinutes?: number;
  servings: number;
  categoryId?: string;
  tagIds?: string[];
  ingredients: RecipeIngredientCreate[];
  steps: RecipeStepCreate[];
  nutrition?: NutritionInfoCreate;
}

export interface RecipeUpdateRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  cookTimeMinutes?: number;
  prepTimeMinutes?: number;
  servings?: number;
  categoryId?: string;
  tagIds?: string[];
  ingredients?: RecipeIngredientCreate[];
  steps?: RecipeStepCreate[];
  nutrition?: NutritionInfoCreate;
}

// ============================================
// Recipe Reference (Spoonacular) Types
// ============================================

export interface RecipeReferenceDetail {
  id: string; // INTERNAL ONLY
  source: 'SPOONACULAR';
  externalId: string;
  title: string;
  imageUrl?: string;
  servings: number;
  status: 'ACTIVE' | 'UNAVAILABLE';
  spoonacularScore?: number;
  healthScore?: number;
  aggregateLikes?: number;
  lastSyncedAt?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition?: NutritionInfo;
  externalMetrics?: ExternalRecipeMetrics;
}

export interface ExternalRecipeMetrics {
  spoonacularScore?: number;
  healthScore?: number;
  aggregateLikes?: number;
}

export interface RecipeReferenceListResponse {
  content: RecipeReferenceDetail[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

// ============================================
// Ingredients Types
// ============================================

export interface InternalIngredient {
  id: string;
  canonicalName: string;
  normalizedName: string;
  category?: string;
  unitCategory: 'MASS' | 'VOLUME' | 'COUNT';
  defaultUnit: string;
}

export interface InternalIngredientListResponse {
  content: InternalIngredient[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface IngredientMapping {
  id: string;
  internalIngredientId: string;
  internalIngredient: InternalIngredient;
  externalName: string;
  source: 'SPOONACULAR';
  status: 'MAPPED' | 'UNMAPPED';
  confidence: number;
}

export interface CreateInternalIngredientRequest {
  canonicalName: string;
  category?: string;
  unitCategory: 'MASS' | 'VOLUME' | 'COUNT';
  defaultUnit: string;
}

export interface CreateIngredientMappingRequest {
  internalIngredientId: string;
  externalName: string;
  source?: 'SPOONACULAR';
  status?: 'MAPPED' | 'UNMAPPED';
  confidence?: number;
}

export interface NormalizeIngredientsRequest {
  texts: string[];
}

export interface NormalizedIngredient {
  originalText: string;
  internalIngredientId?: string;
  canonicalName?: string;
  quantity?: number;
  unit?: string;
  status: 'MAPPED' | 'UNMAPPED';
}

// ============================================
// Favorites Types
// ============================================

export interface Favorite {
  id: string;
  recipeId?: string;
  recipeReferenceId?: string;
  createdAt: string;
}

export interface FavoriteListResponse {
  content: RecipeListItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface CreateFavoriteRequest {
  recipeId?: string;
  recipeReferenceId?: string;
}

// ============================================
// Ratings Types
// ============================================

export interface Rating {
  id: string;
  score: number;
  averageScore: number;
  totalRatings: number;
  distribution: Record<string, number>;
}

export interface RatingSummary {
  averageScore: number;
  totalRatings: number;
  distribution: Record<string, number>;
  userRating?: number;
}

export interface CreateRatingRequest {
  recipeId?: string;
  recipeReferenceId?: string;
  score: number; // 1-5
}

// ============================================
// Comments Types
// ============================================

export interface Comment {
  id: string;
  content: string;
  user: UserProfile;
  parentId?: string;
  repliesCount: number;
  createdAt: string;
}

export interface CommentListResponse {
  content: Comment[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface CreateCommentRequest {
  recipeId?: string;
  recipeReferenceId?: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// ============================================
// Reports Types
// ============================================

export interface Report {
  id: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReportListResponse {
  content: Report[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface CreateReportRequest {
  recipeId?: string;
  recipeReferenceId?: string;
  commentId?: string;
  reason: 'SPAM' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'FAKE' | 'OTHER';
}

export interface ResolveReportRequest {
  status: 'RESOLVED' | 'REJECTED';
  adminNote: string;
}

// ============================================
// Meal Plans Types
// ============================================

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface MealPlanListResponse {
  content: MealPlan[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface MealPlanItem {
  id: string;
  recipeId?: string;
  recipeReferenceId?: string;
  date: string;
  mealType: MealType;
  servings: number;
  sortOrder: number;
}

export interface MealPlanDetail {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  items: MealPlanItem[];
}

export interface CreateMealPlanRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateMealPlanRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface CreateMealPlanItemRequest {
  recipeId?: string;
  recipeReferenceId?: string;
  date: string;
  mealType: MealType;
  servings: number;
  sortOrder: number;
}

export interface UpdateMealPlanItemRequest {
  servings?: number;
  sortOrder?: number;
}

// ============================================
// Shopping Lists Types
// ============================================

export type ShoppingListStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface ShoppingList {
  id: string;
  name: string;
  sourceType: 'RECIPE' | 'MEAL_PLAN' | 'MANUAL';
  sourceId?: string;
  status: ShoppingListStatus;
  createdAt: string;
}

export interface ShoppingListListResponse {
  content: ShoppingList[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface ShoppingListItem {
  id: string;
  internalIngredientId?: string;
  originalText: string;
  quantity: string; // VN format: "1.000", "100.000"
  unit: string;
  isChecked: boolean;
  sortOrder: number;
}

export interface ShoppingListDetail {
  id: string;
  name: string;
  sourceType: 'RECIPE' | 'MEAL_PLAN' | 'MANUAL';
  sourceId?: string;
  status: ShoppingListStatus;
  createdAt: string;
  items: ShoppingListItem[];
}

export interface CreateShoppingListRequest {
  name: string;
  sourceType?: 'RECIPE' | 'MEAL_PLAN' | 'MANUAL';
  sourceId?: string;
}

export interface GenerateShoppingListFromRecipeRequest {
  recipeId?: string;
  recipeReferenceId?: string;
  servings?: number;
}

export interface GenerateShoppingListFromMealPlanRequest {
  mealPlanId: string;
}

export interface UpdateShoppingListRequest {
  name?: string;
  status?: ShoppingListStatus;
}

export interface UpdateShoppingListItemRequest {
  isChecked?: boolean;
  quantity?: number;
  unit?: string;
}

// ============================================
// Recommendations Types
// ============================================

export interface RecommendationItem {
  title: string;
  thumbnailUrl?: string;
  cookTimeMinutes: number;
  servings: number;
  authorName: string;
  reason: string;
  score: number;
}

// ============================================
// Admin Types
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'ACTIVE' | 'BANNED';
  recipeCount: number;
  createdAt: string;
}

export interface AdminUserListResponse {
  content: AdminUser[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface AdminRejectRecipeRequest {
  reason: string;
}

export interface ChangeUserRoleRequest {
  role: UserRole;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  activeUsers: number;
  publishedRecipes: number;
  topRatedRecipes: Array<{
    id: string;
    title: string;
    averageRating: number;
    totalRatings: number;
  }>;
  usersGrowth: Array<{
    date: string;
    newUsers: number;
  }>;
  recipesGrowth: Array<{
    date: string;
    newRecipes: number;
  }>;
  engagement: {
    totalFavorites: number;
    totalRatings: number;
    totalComments: number;
  };
}

// ============================================
// Upload Types
// ============================================

export interface ImageUploadResponse {
  url: string;
  path: string;
}

// ============================================
// Query/Filters
// ============================================

export interface RecipeFilters {
  search?: string;
  category?: string;
  cuisine?: string;
  diet?: string;
  minCookTime?: number;
  maxCookTime?: number;
  servings?: number;
  sortBy?: 'createdAt' | 'cookTimeMinutes' | 'servings' | 'title';
  sortOrder?: 'asc' | 'desc';
}