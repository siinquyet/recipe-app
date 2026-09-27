import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MealType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMealPlanDto,
  CreateMealPlanItemDto,
  UpdateMealPlanDto,
  UpdateMealPlanItemDto,
} from './dto/meal-plan.dto';

/** Thứ tự hiển thị các bữa trong ngày */
const MEAL_ORDER: Record<MealType, number> = {
  [MealType.BREAKFAST]: 0,
  [MealType.LUNCH]: 1,
  [MealType.DINNER]: 2,
  [MealType.SNACK]: 3,
};

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  // ---------- MealPlan ----------

  async create(dto: CreateMealPlanDto, userId: string) {
    this.assertDateRange(dto.startDate, dto.endDate);
    return this.prisma.mealPlan.create({
      data: {
        userId,
        name: dto.name.trim(),
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: true,
      },
      include: { items: true },
    });
  }

  async findAll(userId: string) {
    const plans = await this.prisma.mealPlan.findMany({
      where: { userId },
      orderBy: [{ startDate: 'desc' }],
      include: {
        items: {
          select: { id: true, date: true, mealType: true, servings: true, sortOrder: true },
        },
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      startDate: plan.startDate,
      endDate: plan.endDate,
      isActive: plan.isActive,
      totalItems: plan.items.length,
      // Tổng số món theo từng bữa -> web/mobile hiển thị nhanh
      itemsByMeal: this.countByMeal(plan.items),
      createdAt: plan.createdAt,
    }));
  }

  async findOne(id: string, userId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            recipe: { select: { id: true, title: true, thumbnailUrl: true, cookTimeMinutes: true } },
            recipeReference: { select: { id: true, title: true, imageUrl: true, servings: true, status: true } },
          },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('[MEAL-01] Kế hoạch bữa ăn không tồn tại');
    }

    const items = [...plan.items].sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType] ||
        a.sortOrder - b.sortOrder,
    );

    return { ...plan, items };
  }

  async update(id: string, dto: UpdateMealPlanDto, userId: string) {
    const plan = await this.findOneOwned(id, userId);

    const startDate = dto.startDate ?? plan.startDate;
    const endDate = dto.endDate ?? plan.endDate;
    this.assertDateRange(startDate, endDate);

    // Các món đã thêm phải vẫn nằm trong khoảng ngày mới
    const outOfRange = plan.items.filter(
      (item) => item.date < startDate || item.date > endDate,
    );
    if (outOfRange.length > 0) {
      throw new BadRequestException(
        `[MEAL-02] ${outOfRange.length} món đã thêm nằm ngoài khoảng ngày mới, hãy xóa hoặc chuyển món trước`,
      );
    }

    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.startDate !== undefined ? { startDate: dto.startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { items: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.mealPlan.delete({ where: { id } });
    return { message: '[MEAL-01] Đã xóa kế hoạch bữa ăn' };
  }

  // ---------- MealPlanItem ----------

  async addItem(planId: string, dto: CreateMealPlanItemDto, userId: string) {
    const plan = await this.findOneOwned(planId, userId);

    // MEAL-02: ngày của món phải nằm trong khoảng của kế hoạch
    if (dto.date < plan.startDate || dto.date > plan.endDate) {
      throw new BadRequestException('[MEAL-02] Ngày của món không nằm trong khoảng thời gian của kế hoạch');
    }

    // MEAL-04: chỉ thêm công thức APPROVED hoặc reference ACTIVE
    const { servings, recipeData } = await this.resolveRecipeSource(dto);

    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(planId, dto.date, dto.mealType));

    // MEAL-05: không trùng date + mealType + sortOrder
    const duplicate = await this.prisma.mealPlanItem.findFirst({
      where: { mealPlanId: planId, date: dto.date, mealType: dto.mealType, sortOrder },
    });
    if (duplicate) {
      throw new ConflictException('[MEAL-05] Đã có món khác ở cùng ngày và cùng bữa, vui lòng đổi thứ tự');
    }

    return this.prisma.mealPlanItem.create({
      data: { mealPlanId: planId, date: dto.date, mealType: dto.mealType, servings, sortOrder, ...recipeData },
      include: this.itemInclude(),
    });
  }

  async updateItem(planId: string, itemId: string, dto: UpdateMealPlanItemDto, userId: string) {
    const plan = await this.findOneOwned(planId, userId);
    const item = await this.prisma.mealPlanItem.findFirst({ where: { id: itemId, mealPlanId: planId } });
    if (!item) {
      throw new NotFoundException('[MEAL-01] Món trong kế hoạch không tồn tại');
    }

    const date = dto.date ?? item.date;
    const mealType = dto.mealType ?? item.mealType;
    const sortOrder = dto.sortOrder ?? item.sortOrder;

    if (date < plan.startDate || date > plan.endDate) {
      throw new BadRequestException('[MEAL-02] Ngày của món không nằm trong khoảng thời gian của kế hoạch');
    }

    const duplicate = await this.prisma.mealPlanItem.findFirst({
      where: { id: { not: itemId }, mealPlanId: planId, date, mealType, sortOrder },
    });
    if (duplicate) {
      throw new ConflictException('[MEAL-05] Đã có món khác ở cùng ngày và cùng bữa, vui lòng đổi thứ tự');
    }

    return this.prisma.mealPlanItem.update({
      where: { id: itemId },
      data: {
        ...(dto.date !== undefined ? { date: dto.date } : {}),
        ...(dto.mealType !== undefined ? { mealType: dto.mealType } : {}),
        ...(dto.servings !== undefined ? { servings: dto.servings } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
      include: this.itemInclude(),
    });
  }

  async removeItem(planId: string, itemId: string, userId: string) {
    await this.findOneOwned(planId, userId);
    const item = await this.prisma.mealPlanItem.findFirst({ where: { id: itemId, mealPlanId: planId } });
    if (!item) {
      throw new NotFoundException('[MEAL-01] Món trong kế hoạch không tồn tại');
    }
    await this.prisma.mealPlanItem.delete({ where: { id: itemId } });
    return { message: '[MEAL-01] Đã xóa món khỏi kế hoạch' };
  }

  // ---------- Helper ----------

  /** Chỉ chủ sở hữu mới được thấy/ghi (tránh lộ tồn tại của plan của người khác) */
  private async findOneOwned(id: string, userId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { id, userId },
      include: { items: { select: { id: true, date: true, mealType: true, servings: true, sortOrder: true } } },
    });
    if (!plan) {
      throw new NotFoundException('[MEAL-01] Kế hoạch bữa ăn không tồn tại');
    }
    return plan;
  }

  private assertDateRange(startDate: Date, endDate: Date) {
    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('[MEAL-02] Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    }
    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 366) {
      throw new BadRequestException('[MEAL-02] Kế hoạch không được dài quá 366 ngày');
    }
  }

  /** MEAL-04 + MEAL-06: xác thực nguồn công thức, trả về servings mặc định + data tạo item */
  private async resolveRecipeSource(dto: Pick<CreateMealPlanItemDto, 'recipeId' | 'recipeReferenceId' | 'servings'>) {
    if (dto.recipeId && dto.recipeReferenceId) {
      throw new BadRequestException('[MEAL-06] Chỉ được chọn công thức nội bộ hoặc công thức tham khảo, không chọn cả hai');
    }
    if (!dto.recipeId && !dto.recipeReferenceId) {
      throw new BadRequestException('[MEAL-06] Phải chọn công thức nội bộ hoặc công thức tham khảo');
    }

    if (dto.servings !== undefined && dto.servings < 1) {
      throw new BadRequestException('[MEAL-03] Khẩu phần phải lớn hơn 0');
    }

    if (dto.recipeId) {
      const recipe = await this.prisma.recipe.findFirst({
        where: { id: dto.recipeId, deletedAt: null },
        select: { id: true, status: true, servings: true },
      });
      if (!recipe) {
        throw new NotFoundException('[MEAL-04] Công thức không tồn tại');
      }
      if (recipe.status !== 'APPROVED') {
        throw new ConflictException('[MEAL-04] Chỉ thêm được công thức đã duyệt (APPROVED) vào kế hoạch');
      }
      return { servings: dto.servings ?? recipe.servings, recipeData: { recipeId: recipe.id } };
    }

    const reference = await this.prisma.recipeReference.findFirst({
      where: { id: dto.recipeReferenceId },
      select: { id: true, status: true, servings: true },
    });
    if (!reference) {
      throw new NotFoundException('[MEAL-04] Công thức tham khảo không tồn tại');
    }
    if (reference.status !== 'ACTIVE') {
      throw new ConflictException('[MEAL-04] Chỉ thêm được công thức tham khảo đang ACTIVE vào kế hoạch');
    }
    return {
      servings: dto.servings ?? Math.max(1, reference.servings || 1),
      recipeData: { recipeReferenceId: reference.id },
    };
  }

  private async nextSortOrder(mealPlanId: string, date: Date, mealType: MealType) {
    const last = await this.prisma.mealPlanItem.findFirst({
      where: { mealPlanId, date, mealType },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  private countByMeal(items: Array<{ mealType: MealType }>) {
    const result: Record<MealType, number> = {
      BREAKFAST: 0,
      LUNCH: 0,
      DINNER: 0,
      SNACK: 0,
    };
    for (const item of items) {
      result[item.mealType] += 1;
    }
    return result;
  }

  private itemInclude(): Prisma.MealPlanItemInclude {
    return {
      recipe: { select: { id: true, title: true, thumbnailUrl: true, cookTimeMinutes: true } },
      recipeReference: { select: { id: true, title: true, imageUrl: true, status: true } },
    };
  }
}
