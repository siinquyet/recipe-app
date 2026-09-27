import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ShoppingListStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AggregationService,
  type AggregatedIngredientLine,
  type ScaledIngredientLine,
} from './services/aggregation.service';
import {
  CreateShoppingListDto,
  CreateShoppingListItemDto,
  GenerateFromRecipeDto,
  ShoppingListQueryDto,
  UpdateShoppingListDto,
  UpdateShoppingListItemDto,
} from './dto/shopping-list.dto';

const MAX_NAME_LENGTH = 200;

@Injectable()
export class ShoppingListsService {
  constructor(
    private prisma: PrismaService,
    private aggregation: AggregationService,
  ) {}

  // ---------- Danh sách ----------

  async createManual(dto: CreateShoppingListDto, userId: string) {
    if (dto.recipeId || dto.recipeReferenceId) {
      // Có nguồn -> đi qua luồng generate để áp BR-03/BR-04
      return this.generateFromRecipe(dto, userId);
    }
    return this.prisma.shoppingList.create({
      data: {
        userId,
        name: dto.name.trim(),
        sourceType: 'MANUAL',
        sourceId: null,
        status: ShoppingListStatus.ACTIVE,
        items: { create: [] },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async findAll(query: ShoppingListQueryDto, userId: string) {
    const lists = await this.prisma.shoppingList.findMany({
      where: { userId, ...(query.status ? { status: query.status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { isChecked: true } } },
    });

    return lists.map((list) => {
      const totalItems = list.items.length;
      const checkedItems = list.items.filter((i) => i.isChecked).length;
      return {
        id: list.id,
        name: list.name,
        sourceType: list.sourceType,
        sourceId: list.sourceId,
        status: list.status,
        totalItems,
        checkedItems,
        progress: totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const list = await this.prisma.shoppingList.findFirst({
      where: { id, userId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            internalIngredient: {
              select: { id: true, canonicalName: true, unitCategory: true, defaultUnit: true },
            },
          },
        },
      },
    });
    if (!list) {
      throw new NotFoundException('[SHOP-01] Danh sách mua sắm không tồn tại');
    }

    const checkedItems = list.items.filter((i) => i.isChecked).length;
    return {
      ...list,
      items: list.items.map((item) => ({
        ...item,
        // Decimal -> string để client tự format theo locale (không mất precision)
        quantity: item.quantity.toString(),
      })),
      totalItems: list.items.length,
      checkedItems,
      progress: list.items.length === 0 ? 0 : Math.round((checkedItems / list.items.length) * 100),
    };
  }

  async update(id: string, dto: UpdateShoppingListDto, userId: string) {
    await this.findOneOwned(id, userId);
    return this.prisma.shoppingList.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  /** Xóa = lưu trữ (ARCHIVED) để không mất lịch sử mua sắm */
  async remove(id: string, userId: string) {
    await this.findOneOwned(id, userId);
    await this.prisma.shoppingList.update({
      where: { id },
      data: { status: ShoppingListStatus.ARCHIVED },
    });
    return { message: '[SHOP-01] Đã lưu trữ danh sách mua sắm' };
  }

  // ---------- Generate ----------

  /** BR-03 + BR-04: tạo danh sách từ 1 công thức nội bộ hoặc công thức tham khảo */
  async generateFromRecipe(dto: GenerateFromRecipeDto, userId: string) {
    if (dto.recipeId && dto.recipeReferenceId) {
      throw new BadRequestException('[SHOP-02] Chỉ được chọn công thức nội bộ hoặc công thức tham khảo, không chọn cả hai');
    }
    if (!dto.recipeId && !dto.recipeReferenceId) {
      throw new BadRequestException('[SHOP-02] Phải chọn công thức nội bộ hoặc công thức tham khảo');
    }

    const { title, baseServings, ingredients, sourceId } = dto.recipeId
      ? await this.loadRecipe(dto.recipeId)
      : await this.loadRecipeReference(dto.recipeReferenceId!);

    if (ingredients.length === 0) {
      throw new BadRequestException('[SHOP-02] Công thức chưa có nguyên liệu nào để tạo danh sách mua sắm');
    }

    const targetServings = dto.servings ?? baseServings;
    if (targetServings < 1) {
      throw new BadRequestException('[SHOP-02] Khẩu phần phải lớn hơn 0');
    }

    const { lines, warnings } = this.aggregateRecipeIngredients(ingredients, baseServings, targetServings, title);
    const created = await this.createList(userId, {
      name: dto.name?.trim() || `Mua sắm: ${title}`,
      sourceType: 'RECIPE',
      sourceId,
      lines,
    });

    return { ...created, warnings };
  }

  /** BR-03 + BR-04: gộp toàn bộ món trong kế hoạch (dùng khẩu phần override của từng món) */
  async generateFromMealPlan(mealPlanId: string, name: string | undefined, userId: string) {
    const plan = await this.prisma.mealPlan.findFirst({
      where: { id: mealPlanId, userId },
      include: {
        items: {
          include: {
            recipe: { include: { ingredients: true } },
          },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException('[SHOP-01] Kế hoạch bữa ăn không tồn tại');
    }
    if (plan.items.length === 0) {
      throw new BadRequestException('[SHOP-02] Kế hoạch chưa có món nào để tạo danh sách mua sắm');
    }

    const scaled: Array<{ line: ScaledIngredientLine; warnings: string[] }> = [];
    const warnings: string[] = [];
    const skipped: string[] = [];

    for (const item of plan.items) {
      if (!item.recipe) {
        // Món từ công thức tham khảo chưa có bảng nguyên liệu nội bộ -> bỏ qua có ghi nhận
        skipped.push(
          item.recipeReferenceId
            ? `[SHOP-02] Bỏ qua món dùng công thức tham khảo (chưa có dữ liệu nguyên liệu)`
            : `[SHOP-02] Bỏ qua món không còn công thức`,
        );
        continue;
      }
      if (item.recipe.ingredients.length === 0) {
        skipped.push(`[SHOP-02] Bỏ qua món "${item.recipe.title}" vì chưa có nguyên liệu`);
        continue;
      }
      for (const ing of item.recipe.ingredients) {
        const result = this.aggregation.scaleQuantity(
          Number(ing.quantity),
          item.recipe.servings,
          item.servings,
          `Món "${item.recipe.title}" ngày ${item.date.toISOString().slice(0, 10)}`,
        );
        warnings.push(...result.warnings);
        scaled.push({
          line: {
            internalIngredientId: ing.internalIngredientId ?? undefined,
            originalText: ing.originalText,
            quantity: result.quantity,
            unit: ing.unit,
          },
          warnings: result.warnings,
        });
      }
    }

    if (scaled.length === 0) {
      throw new BadRequestException('[SHOP-02] Kế hoạch không có món nào chứa nguyên liệu để tạo danh sách mua sắm');
    }

    const aggregated = this.aggregation.aggregate(scaled.map((s) => s.line));
    warnings.push(...aggregated.warnings, ...skipped);

    const created = await this.createList(userId, {
      name: name?.trim() || `Mua sắm: ${plan.name}`,
      sourceType: 'MEAL_PLAN',
      sourceId: plan.id,
      lines: aggregated.lines,
    });

    return { ...created, warnings };
  }

  // ---------- Item thủ công ----------

  async addItem(listId: string, dto: CreateShoppingListItemDto, userId: string) {
    const list = await this.findOneOwned(listId, userId);

    if (dto.internalIngredientId) {
      const ing = await this.prisma.internalIngredient.findUnique({
        where: { id: dto.internalIngredientId },
        select: { id: true },
      });
      if (!ing) {
        throw new NotFoundException('[SHOP-02] Nguyên liệu nội bộ không tồn tại');
      }
    }

    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(listId));
    return this.prisma.shoppingListItem.create({
      data: {
        shoppingListId: list.id,
        internalIngredientId: dto.internalIngredientId ?? null,
        originalText: dto.originalText.trim(),
        quantity: new Prisma.Decimal(dto.quantity ?? 0),
        unit: (dto.unit ?? 'g').trim(),
        sortOrder,
      },
    });
  }

  async updateItem(listId: string, itemId: string, dto: UpdateShoppingListItemDto, userId: string) {
    await this.findOneOwned(listId, userId);
    const item = await this.prisma.shoppingListItem.findFirst({
      where: { id: itemId, shoppingListId: listId },
    });
    if (!item) {
      throw new NotFoundException('[SHOP-01] Món trong danh sách không tồn tại');
    }

    return this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        ...(dto.isChecked !== undefined ? { isChecked: dto.isChecked } : {}),
        ...(dto.quantity !== undefined ? { quantity: new Prisma.Decimal(dto.quantity) } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async removeItem(listId: string, itemId: string, userId: string) {
    await this.findOneOwned(listId, userId);
    const item = await this.prisma.shoppingListItem.findFirst({
      where: { id: itemId, shoppingListId: listId },
    });
    if (!item) {
      throw new NotFoundException('[SHOP-01] Món trong danh sách không tồn tại');
    }
    await this.prisma.shoppingListItem.delete({ where: { id: itemId } });
    return { message: '[SHOP-01] Đã xóa món khỏi danh sách' };
  }

  // ---------- Helper ----------

  private async findOneOwned(id: string, userId: string) {
    const list = await this.prisma.shoppingList.findFirst({ where: { id, userId } });
    if (!list) {
      throw new NotFoundException('[SHOP-01] Danh sách mua sắm không tồn tại');
    }
    return list;
  }

  private async loadRecipe(recipeId: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, deletedAt: null },
      include: { ingredients: true },
    });
    if (!recipe) {
      throw new NotFoundException('[SHOP-02] Công thức không tồn tại');
    }
    if (recipe.status !== 'APPROVED') {
      throw new ConflictException('[SHOP-02] Chỉ tạo danh sách mua sắm từ công thức đã duyệt (APPROVED)');
    }
    return {
      title: recipe.title,
      baseServings: recipe.servings,
      sourceId: recipe.id,
      ingredients: recipe.ingredients,
    };
  }

  /**
   * Công thức tham khảo (Spoonacular) chưa có bảng nguyên liệu nội bộ trong hệ thống,
   * nên không thể sinh danh sách mua sắm -> trả lỗi rõ ràng thay vì tạo list rỗng.
   */
  private async loadRecipeReference(referenceId: string): Promise<never> {
    const reference = await this.prisma.recipeReference.findFirst({
      where: { id: referenceId },
    });
    if (!reference) {
      throw new NotFoundException('[SHOP-02] Công thức tham khảo không tồn tại');
    }
    throw new BadRequestException(
      '[SHOP-02] Công thức tham khảo chưa có dữ liệu nguyên liệu trong hệ thống, hãy dùng công thức nội bộ đã duyệt',
    );
  }

  private aggregateRecipeIngredients(
    ingredients: Array<{ internalIngredientId: string | null; originalText: string; quantity: unknown; unit: string }>,
    baseServings: number,
    targetServings: number,
    title: string,
  ) {
    const scaled = ingredients.map((ing) => {
      const result = this.aggregation.scaleQuantity(
        Number(ing.quantity),
        baseServings,
        targetServings,
        `Công thức "${title}"`,
      );
      return {
        line: {
          internalIngredientId: ing.internalIngredientId ?? undefined,
          originalText: ing.originalText,
          quantity: result.quantity,
          unit: ing.unit,
        },
        warnings: result.warnings,
      };
    });

    const aggregated = this.aggregation.aggregate(scaled.map((s) => s.line));
    return {
      lines: aggregated.lines,
      warnings: [...scaled.flatMap((s) => s.warnings), ...aggregated.warnings],
    };
  }

  private async createList(
    userId: string,
    input: { name: string; sourceType: string; sourceId: string; lines: AggregatedIngredientLine[] },
  ) {
    const name = input.name.length > MAX_NAME_LENGTH ? input.name.slice(0, MAX_NAME_LENGTH) : input.name;
    return this.prisma.shoppingList.create({
      data: {
        userId,
        name,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        status: ShoppingListStatus.ACTIVE,
        items: {
          create: input.lines.map((line, index) => ({
            internalIngredientId: line.internalIngredientId ?? null,
            originalText: line.originalText.length > 500 ? line.originalText.slice(0, 500) : line.originalText,
            quantity: new Prisma.Decimal(line.quantity),
            unit: line.unit,
            sortOrder: index + 1,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  private async nextSortOrder(listId: string) {
    const last = await this.prisma.shoppingListItem.findFirst({
      where: { shoppingListId: listId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? 0) + 1;
  }
}
