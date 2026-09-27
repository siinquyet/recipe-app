import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePreferencesDto } from './dto/recommendation.dto';
import {
  CACHE_TTL_MS,
  LOOKBACK_DAYS,
  MIN_INTERACTIONS,
  ScoredItem,
  W_COLLABORATIVE,
  W_CONTENT,
  ACTIVITY_WEIGHTS,
  WEIGHTED_ACTIVITY_TYPES,
  activityWeight,
  applyDiversity,
  combinedScore,
  contentScore,
  normalizeScores,
  normalizeText,
  round4,
  tokenize,
} from './services/scoring';

interface CacheEntry {
  expiresAt: number;
  payload: unknown;
}

export interface RecommendationItem {
  id: string;
  source: 'LOCAL' | 'SPOONACULAR';
  title: string;
  thumbnailUrl: string | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  authorName: string | null;
  reason: string;
  score: number;
  matchedTags?: string[];
}

const DEFAULT_LIMIT = 20;

@Injectable()
export class RecommendationsService {
  /** BR-RECO-02: cache in-memory 1 giờ / user */
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  // ============================ FR-RECO-01 ============================

  async personalized(userId: string, limit?: number): Promise<{
    content: RecommendationItem[];
    fallback: boolean;
    fallbackReason: string | null;
    interactionCount: number;
  }> {
    const take = limit ?? DEFAULT_LIMIT;
    const cacheKey = `reco:${userId}:${take}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as any;
    }

    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        entityType: 'RECIPE',
        type: { in: WEIGHTED_ACTIVITY_TYPES },
        createdAt: { gte: since },
      },
      select: { type: true, entityId: true },
    });

    // Trọng số theo món đã tương tác
    const interactedWeight = new Map<string, number>();
    for (const a of activities) {
      const w = activityWeight(a.type);
      if (w <= 0) continue;
      interactedWeight.set(a.entityId, (interactedWeight.get(a.entityId) ?? 0) + w);
    }
    const interactionCount = interactedWeight.size;

    if (interactionCount < MIN_INTERACTIONS) {
      // BR-RECO-01: chưa đủ dữ liệu -> fallback món phổ biến
      const content = await this.popularRecipes(userId, take);
      const payload = {
        content,
        fallback: true,
        fallbackReason:
          '[RECO-01] Chưa đủ dữ liệu để gợi ý (cần tối thiểu 3 tương tác), đang hiển thị món phổ biến',
        interactionCount,
      };
      this.setCache(cacheKey, payload);
      return payload;
    }

    const seeds = await this.loadSeeds([...interactedWeight.keys()]);
    if (!seeds.size) {
      const content = await this.popularRecipes(userId, take);
      const payload = {
        content,
        fallback: true,
        fallbackReason:
          '[RECO-01] Chưa đủ dữ liệu để gợi ý (món đã tương tác không còn khả dụng), đang hiển thị món phổ biến',
        interactionCount,
      };
      this.setCache(cacheKey, payload);
      return payload;
    }

    const exclude = await this.buildExcludeSet(userId, [...interactedWeight.keys()]);
    const candidates = await this.loadCandidates(exclude);

    // Hồ sơ token của user (chỉ gồm món seed còn khả dụng)
    const profileTokens = new Set<string>();
    const seedTitles: string[] = [];
    for (const [id, w] of interactedWeight) {
      const seed = seeds.get(id);
      if (!seed) continue;
      seedTitles.push(seed.title);
      for (const t of seed.tokens) profileTokens.add(t);
      void w;
    }
    const profile = [...profileTokens];

    // ---- Content-based ----
    const contentScores = new Map<string, number>();
    for (const c of candidates) {
      contentScores.set(c.key, contentScore(c.tokens, profile));
    }

    // ---- Collaborative ----
    const collaborative = await this.collaborativeScores(userId, seeds, exclude);

    const scored: ScoredItem[] = [];
    for (const c of candidates) {
      const collab = collaborative.get(c.key) ?? 0;
      const cont = contentScores.get(c.key) ?? 0;
      if (collab <= 0 && cont <= 0) continue; // không có tín hiệu nào -> bỏ qua
      scored.push({ key: c.key, collaborative: collab, content: cont, group: c.group });
    }

    if (!scored.length) {
      const content = await this.popularRecipes(userId, take);
      const payload = {
        content,
        fallback: true,
        fallbackReason: '[RECO-02] Không tìm thấy món phù hợp với lịch sử của bạn',
        interactionCount,
      };
      this.setCache(cacheKey, payload);
      return payload;
    }

    const normalized = normalizeScores(scored);
    const withScores = normalized.map((s) => ({ ...s, score: round4(combinedScore(s)) }));
    const diversified = applyDiversity(withScores);
    const byKey = new Map<string, (typeof diversified)[number]>();
    for (const d of diversified) byKey.set(d.key, d);

    const content: RecommendationItem[] = [];
    for (const c of candidates) {
      if (content.length >= take) break;
      const s = byKey.get(c.key);
      if (!s) continue;
      content.push({
        id: c.id,
        source: c.source,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        cookTimeMinutes: c.cookTimeMinutes,
        servings: c.servings,
        authorName: c.authorName,
        reason: this.buildReason(s, seedTitles),
        score: s.score,
      });
    }

    const payload = { content, fallback: false, fallbackReason: null, interactionCount };
    this.setCache(cacheKey, payload);
    return payload;
  }

  // ============================ FR-RECO-02 ============================

  async dietary(userId: string, limit?: number) {
    const take = limit ?? DEFAULT_LIMIT;
    const cacheKey = `recoDiet:${userId}:${take}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as any;
    }

    const prefs = await this.prisma.userPreferences.findUnique({ where: { userId } });
    const dietaryTags = (prefs?.dietaryTags as unknown as string[] | undefined) ?? [];
    const normalizedPrefs = dietaryTags.map(normalizeText).filter(Boolean);

    if (!normalizedPrefs.length) {
      // Chưa khai báo khẩu vị -> trả món phổ biến, client tự hiển thị form thiết lập
      const content = await this.popularRecipes(userId, take);
      const payload = { content, dietaryTags, hasPreferences: false };
      this.setCache(cacheKey, payload);
      return payload;
    }

    const recipes = await this.prisma.recipe.findMany({
      where: { deletedAt: null, status: 'APPROVED', authorId: { not: userId } },
      include: {
        tags: { select: { name: true } },
        category: { select: { name: true } },
        author: { select: { displayName: true } },
      },
      take: 200,
    });

    const matched: (RecommendationItem & { matchedTags: string[] })[] = [];
    for (const r of recipes) {
      const labels = [
        ...r.tags.map((t) => t.name),
        ...(r.category?.name ? [r.category.name] : []),
      ];
      const hit = normalizedPrefs.filter((p) => labels.some((l) => matchLabel(normalizeText(l), p)));
      if (!hit.length) continue;
      matched.push({
        id: r.id,
        source: 'LOCAL',
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
        authorName: r.author?.displayName ?? null,
        reason: `Phù hợp khẩu vị: ${hit.join(', ')}`,
        score: round4(hit.length / normalizedPrefs.length),
        matchedTags: hit,
      });
    }

    // RecipeReference: không có trường diet/cuisine nên khớp theo tiêu đề
    const references = await this.prisma.recipeReference.findMany({
      where: { status: 'ACTIVE' },
      take: 200,
    });
    for (const ref of references) {
      const titleNorm = normalizeText(ref.title);
      const hit = normalizedPrefs.filter((p) => matchLabel(titleNorm, p));
      if (!hit.length) continue;
      matched.push({
        id: ref.id,
        source: 'SPOONACULAR',
        title: ref.title,
        thumbnailUrl: ref.imageUrl,
        cookTimeMinutes: null,
        servings: ref.servings,
        authorName: null,
        reason: `Phù hợp khẩu vị: ${hit.join(', ')}`,
        score: round4(hit.length / normalizedPrefs.length),
        matchedTags: hit,
      });
    }

    if (!matched.length) {
      throw new NotFoundException('[RECO-02] Không tìm thấy món phù hợp với khẩu vị của bạn');
    }

    matched.sort((a, b) => b.score - a.score);
    const payload = {
      content: matched.slice(0, take),
      dietaryTags,
      hasPreferences: true,
    };
    this.setCache(cacheKey, payload);
    return payload;
  }

  // ============================ Sở thích ăn uống ============================

  async getPreferences(userId: string) {
    const prefs = await this.prisma.userPreferences.findUnique({ where: { userId } });
    if (!prefs) {
      return { dietaryTags: [], allergies: [], cuisinePrefs: [] };
    }
    return {
      dietaryTags: (prefs.dietaryTags as unknown as string[]) ?? [],
      allergies: (prefs.allergies as unknown as string[]) ?? [],
      cuisinePrefs: (prefs.cuisinePrefs as unknown as string[]) ?? [],
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const data = {
      dietaryTags: dto.dietaryTags ?? ([] as string[]),
      allergies: dto.allergies ?? ([] as string[]),
      cuisinePrefs: dto.cuisinePrefs ?? ([] as string[]),
    };
    const prefs = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    // Sở thích đổi -> cache khẩu vị không còn đúng
    this.invalidateUser(userId);
    return {
      dietaryTags: prefs.dietaryTags as unknown as string[],
      allergies: prefs.allergies as unknown as string[],
      cuisinePrefs: prefs.cuisinePrefs as unknown as string[],
    };
  }

  // ============================ Nội bộ ============================

  private setCache(key: string, payload: unknown) {
    if (this.cache.size > 1000) this.cache.clear();
    this.cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  }

  private invalidateUser(userId: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) this.cache.delete(key);
    }
  }

  /** Món đã tương tác: lấy title/tag/nguyên liệu để dựng hồ sơ */
  private async loadSeeds(recipeIds: string[]) {
    const rows = await this.prisma.recipe.findMany({
      where: { id: { in: recipeIds }, deletedAt: null, status: 'APPROVED' },
      include: {
        tags: { select: { name: true } },
        category: { select: { name: true } },
        ingredients: { select: { originalText: true } },
      },
    });
    const map = new Map<string, { title: string; tokens: string[] }>();
    for (const r of rows) {
      const tokens = [
        ...tokenize(r.title),
        ...r.tags.flatMap((t) => tokenize(t.name)),
        ...(r.category?.name ? tokenize(r.category.name) : []),
        ...r.ingredients.flatMap((i) => tokenize(i.originalText)),
      ];
      map.set(r.id, { title: r.title, tokens: [...new Set(tokens)] });
    }
    return map;
  }

  /** Ứng viên: APPROVED (không phải của mình) + reference ACTIVE */
  private async loadCandidates(exclude: Set<string>) {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        deletedAt: null,
        status: 'APPROVED',
        id: { notIn: [...exclude].filter((x) => x.length === 36) },
      },
      include: {
        tags: { select: { name: true } },
        category: { select: { name: true } },
        ingredients: { select: { originalText: true } },
        author: { select: { displayName: true } },
      },
      take: 300,
    });

    const out: Candidate[] = [];
    for (const r of recipes) {
      if (exclude.has(r.id)) continue;
      const tokens = [
        ...tokenize(r.title),
        ...r.tags.flatMap((t) => tokenize(t.name)),
        ...(r.category?.name ? tokenize(r.category.name) : []),
        ...r.ingredients.flatMap((i) => tokenize(i.originalText)),
      ];
      out.push({
        key: `RECIPE:${r.id}`,
        id: r.id,
        source: 'LOCAL',
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
        authorName: r.author?.displayName ?? null,
        tokens: [...new Set(tokens)],
        group: r.tags[0]?.name ?? r.category?.name ?? '',
      });
    }

    const refIds = [...exclude].filter((k) => k.startsWith('REF:')).map((k) => k.slice(4));
    const references = await this.prisma.recipeReference.findMany({
      where: { status: 'ACTIVE', ...(refIds.length ? { id: { notIn: refIds } } : {}) },
      take: 100,
    });
    for (const ref of references) {
      out.push({
        key: `REF:${ref.id}`,
        id: ref.id,
        source: 'SPOONACULAR',
        title: ref.title,
        thumbnailUrl: ref.imageUrl,
        cookTimeMinutes: null,
        servings: ref.servings,
        authorName: null,
        tokens: tokenize(ref.title),
        group: '',
      });
    }
    return out;
  }

  /**
   * BR-RECO-03 + spec: loại trừ món đã favorite / rate / đã có trong meal plan /
   * đã tương tác / do chính user tạo.
   */
  private async buildExcludeSet(userId: string, interactedIds: string[]): Promise<Set<string>> {
    const exclude = new Set<string>();
    for (const id of interactedIds) exclude.add(id);

    const [favorites, ratings, planned, ownRecipes] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId, OR: [{ recipeId: { not: null } }, { recipeReferenceId: { not: null } }] },
        select: { recipeId: true, recipeReferenceId: true },
      }),
      this.prisma.rating.findMany({
        where: { userId, OR: [{ recipeId: { not: null } }, { recipeReferenceId: { not: null } }] },
        select: { recipeId: true, recipeReferenceId: true },
      }),
      this.prisma.mealPlanItem.findMany({
        where: { mealPlan: { userId } },
        select: { recipeId: true, recipeReferenceId: true },
      }),
      this.prisma.recipe.findMany({
        where: { authorId: userId },
        select: { id: true },
      }),
    ]);

    for (const f of favorites) {
      if (f.recipeId) exclude.add(f.recipeId);
      if (f.recipeReferenceId) exclude.add(`REF:${f.recipeReferenceId}`);
    }
    for (const r of ratings) {
      if (r.recipeId) exclude.add(r.recipeId);
      if (r.recipeReferenceId) exclude.add(`REF:${r.recipeReferenceId}`);
    }
    for (const p of planned) {
      if (p.recipeId) exclude.add(p.recipeId);
      if (p.recipeReferenceId) exclude.add(`REF:${p.recipeReferenceId}`);
    }
    for (const o of ownRecipes) exclude.add(o.id);

    return exclude;
  }

  /** Collaborative: người dùng tương tự đã tương tác với món gì */
  private async collaborativeScores(
    userId: string,
    seeds: Map<string, { title: string; tokens: string[] }>,
    exclude: Set<string>,
  ): Promise<Map<string, number>> {
    const seedIds = [...seeds.keys()];
    if (!seedIds.length) return new Map();

    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    // Người dùng khác có tương tác trên bất kỳ món seed nào
    const neighbours = await this.prisma.userActivity.findMany({
      where: {
        entityType: 'RECIPE',
        entityId: { in: seedIds },
        userId: { not: userId },
        type: { in: WEIGHTED_ACTIVITY_TYPES },
        createdAt: { gte: since },
      },
      select: { userId: true, entityId: true, type: true },
      take: 1000,
    });
    if (!neighbours.length) return new Map();

    const byUser = new Map<string, Set<string>>();
    for (const n of neighbours) {
      if (!byUser.has(n.userId)) byUser.set(n.userId, new Set());
      byUser.get(n.userId)!.add(n.entityId);
    }

    // Độ giống nhau = số món seed chung / số món seed của user này
    const similar = [...byUser.entries()]
      .map(([uid, ids]) => ({ uid, shared: [...ids].filter((i) => seeds.has(i)).length }))
      .filter((s) => s.shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, 50);
    if (!similar.length) return new Map();

    const similarIds = similar.map((s) => s.uid);
    const theirActivities = await this.prisma.userActivity.findMany({
      where: {
        userId: { in: similarIds },
        entityType: 'RECIPE',
        type: { in: WEIGHTED_ACTIVITY_TYPES },
        createdAt: { gte: since },
      },
      select: { userId: true, entityId: true, type: true },
      take: 2000,
    });

    const simWeight = new Map(similar.map((s) => [s.uid, s.shared]));
    const raw = new Map<string, number>();
    for (const a of theirActivities) {
      if (exclude.has(a.entityId)) continue;
      if (seeds.has(a.entityId)) continue; // đã tương tác rồi
      const w = activityWeight(a.type) * (simWeight.get(a.userId) ?? 0);
      raw.set(a.entityId, (raw.get(a.entityId) ?? 0) + w);
    }
    return raw;
  }

  /** Món phổ biến: nhiều tương tác + nhiều đánh giá nhất */
  private async popularRecipes(userId: string, take: number): Promise<RecommendationItem[]> {
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.userActivity.findMany({
      where: {
        entityType: 'RECIPE',
        type: { in: WEIGHTED_ACTIVITY_TYPES },
        createdAt: { gte: since },
      },
      select: { entityId: true },
      take: 5000,
    });
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.entityId, (counts.get(r.entityId) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
    const ids = top.map(([id]) => id);
    if (!ids.length) {
      return this.newestRecipes(userId, take);
    }

    const recipes = await this.prisma.recipe.findMany({
      where: { id: { in: ids }, deletedAt: null, status: 'APPROVED', authorId: { not: userId } },
      include: { author: { select: { displayName: true } } },
    });
    const countById = new Map(top);
    const sorted = recipes
      .map((r) => ({ r, c: countById.get(r.id) ?? 0 }))
      .sort((a, b) => b.c - a.c)
      .slice(0, take);

    if (!sorted.length) return this.newestRecipes(userId, take);
    return sorted.map(({ r, c }) => ({
      id: r.id,
      source: 'LOCAL' as const,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      cookTimeMinutes: r.cookTimeMinutes,
      servings: r.servings,
      authorName: r.author?.displayName ?? null,
      reason: `Món phổ biến (${c} lượt tương tác)`,
      score: round4(Math.min(1, c / 10)),
    }));
  }

  private async newestRecipes(userId: string, take: number): Promise<RecommendationItem[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { deletedAt: null, status: 'APPROVED', authorId: { not: userId } },
      include: { author: { select: { displayName: true } } },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return recipes.map((r) => ({
      id: r.id,
      source: 'LOCAL' as const,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      cookTimeMinutes: r.cookTimeMinutes,
      servings: r.servings,
      authorName: r.author?.displayName ?? null,
      reason: 'Món mới trên Cookbook',
      score: 0.5,
    }));
  }

  private buildReason(
    s: ScoredItem & { score: number },
    seedTitles: string[],
  ): string {
    const top = seedTitles.slice(0, 2).join(', ');
    if (s.collaborative > 0 && s.collaborative >= s.content) {
      return `Người khác đã yêu thích món tương tự với: ${top}`;
    }
    if (s.content > 0) {
      return `Tương tự món bạn đã xem: ${top}`;
    }
    return 'Gợi ý phổ biến cho bạn';
  }
}

interface Candidate {
  key: string;
  id: string;
  source: 'LOCAL' | 'SPOONACULAR';
  title: string;
  thumbnailUrl: string | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  authorName: string | null;
  tokens: string[];
  group: string;
}

/** Khớp nhãn với khẩu vị: chứa toàn bộ hoặc là tiền tố hợp lệ (tránh "meat" khớp "meatball" sai) */
function matchLabel(label: string, pref: string): boolean {
  if (!label || !pref) return false;
  if (label === pref) return true;
  if (label.includes(pref)) return true;
  // "gluten free" <-> "gluten-free", "low carb" <-> "lowcarb"
  return pref.replace(/-/g, '').length > 2 && label.replace(/-/g, '').includes(pref.replace(/-/g, ''));
}
