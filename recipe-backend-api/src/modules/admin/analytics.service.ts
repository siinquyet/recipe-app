import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ANALYTICS_ALLOWED_DAYS } from './dto/analytics-query.dto';

/**
 * FR-ADM-05 - Analytics Dashboard cho Web Admin.
 *
 * Lưu ý về múi giờ:
 *  - Prisma/MySQL lưu DateTime theo UTC.
 *  - "1 ngày" trên dashboard phải là ngày theo giờ người dùng (mặc định GMT+7),
 *    nếu không biểu đồ sẽ lệch 7 tiếng so với con số người dùng tự đếm.
 *  - Có thể đổi bằng env ANALYTICS_TZ_OFFSET_MINUTES (phút).
 */
const TZ_OFFSET_MINUTES = Number(process.env.ANALYTICS_TZ_OFFSET_MINUTES ?? 7 * 60);

/** BR-05: chỉ tính món có từ MIN_RATINGS đánh giá trở lên */
const MIN_RATINGS = 5;
const TOP_RATED_LIMIT = 10;

const pad = (n: number) => String(n).padStart(2, '0');

/** Ngày theo múi giờ dashboard, dạng YYYY-MM-DD */
function dayKey(d: Date): string {
  const s = new Date(d.getTime() + TZ_OFFSET_MINUTES * 60_000);
  return `${s.getUTCFullYear()}-${pad(s.getUTCMonth() + 1)}-${pad(s.getUTCDate())}`;
}

/**
 * Trục N ngày gần nhất (theo múi giờ dashboard).
 * Trả về mốc bắt đầu (UTC) và danh sách ngày tăng dần.
 */
function buildDayAxis(days: number): { startUtc: Date; keys: string[] } {
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + TZ_OFFSET_MINUTES * 60_000);
  // 00:00 (theo múi giờ dashboard) của hôm nay, rồi lùi về (days - 1) ngày
  const todayMidnightShifted = Date.UTC(
    shiftedNow.getUTCFullYear(),
    shiftedNow.getUTCMonth(),
    shiftedNow.getUTCDate(),
  );
  const startShifted = todayMidnightShifted - (days - 1) * 86_400_000;
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    keys.push(dayKey(new Date(startShifted + i * 86_400_000)));
  }
  return { startUtc: new Date(startShifted - TZ_OFFSET_MINUTES * 60_000), keys };
}

/** Đếm số phần tử theo từng ngày trong trục (ngày không có dữ liệu thì 0) */
function countByDay<T>(rows: T[], keys: string[], getDate: (row: T) => Date): Map<string, number> {
  const map = new Map<string, number>();
  for (const k of keys) map.set(k, 0);
  for (const row of rows) {
    const k = dayKey(getDate(row));
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export interface GrowthPoint {
  date: string;
  newUsers?: number;
  newRecipes?: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(days = 7) {
    const range = (ANALYTICS_ALLOWED_DAYS as readonly number[]).includes(days) ? days : 7;
    const since = new Date(Date.now() - range * 86_400_000);
    const { startUtc, keys } = buildDayAxis(range);

    const [
      totalUsers,
      publishedRecipes,
      // activeUsers: user có ít nhất 1 tương tác trong khoảng (nguồn: UserActivity)
      activeRows,
      topRatedRaw,
      totalFavorites,
      totalRatings,
      totalComments,
      newUsers,
      newRecipes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.recipe.count({ where: { status: 'APPROVED', deletedAt: null } }),
      this.prisma.userActivity.findMany({
        where: { createdAt: { gte: since } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.rating.groupBy({
        by: ['recipeId'],
        where: { recipeId: { not: null } },
        _count: { _all: true },
        _avg: { score: true },
        orderBy: [{ _avg: { score: 'desc' } }, { _count: { recipeId: 'desc' } }],
      }),
      this.prisma.favorite.count(),
      this.prisma.rating.count(),
      this.prisma.comment.count(),
      this.prisma.user.findMany({
        where: { createdAt: { gte: startUtc } },
        select: { createdAt: true },
      }),
      this.prisma.recipe.findMany({
        where: { createdAt: { gte: startUtc }, deletedAt: null },
        select: { createdAt: true },
      }),
    ]);

    // BR-05: lọc >= MIN_RATINGS rồi mới lấy chi tiết món
    const qualified = topRatedRaw
      .filter((r) => r._count._all >= MIN_RATINGS && r.recipeId)
      .slice(0, TOP_RATED_LIMIT);
    const qualifiedIds = qualified.map((r) => r.recipeId as string);
    const recipes = qualifiedIds.length
      ? await this.prisma.recipe.findMany({
          where: { id: { in: qualifiedIds }, status: 'APPROVED', deletedAt: null },
          select: { id: true, title: true },
        })
      : [];
    const titleById = new Map(recipes.map((r) => [r.id, r.title]));

    const topRatedRecipes = qualified
      .filter((r) => titleById.has(r.recipeId as string))
      .map((r) => ({
        id: r.recipeId as string,
        title: titleById.get(r.recipeId as string) as string,
        averageRating: Math.round((r._avg.score ?? 0) * 100) / 100,
        totalRatings: r._count._all,
      }));

    const usersPerDay = countByDay(newUsers, keys, (u) => u.createdAt);
    const recipesPerDay = countByDay(newRecipes, keys, (r) => r.createdAt);

    return {
      rangeDays: range,
      totalUsers,
      activeUsers: activeRows.length,
      publishedRecipes,
      topRatedRecipes,
      usersGrowth: keys.map<GrowthPoint>((k) => ({ date: k, newUsers: usersPerDay.get(k) ?? 0 })),
      recipesGrowth: keys.map<GrowthPoint>((k) => ({ date: k, newRecipes: recipesPerDay.get(k) ?? 0 })),
      engagement: {
        totalFavorites,
        totalRatings,
        totalComments,
      },
    };
  }
}
