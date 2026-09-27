import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma, RecipeStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';

// BR-02: Lifecycle Recipe: DRAFT → PENDING → APPROVED/REJECTED → HIDDEN
const ALLOWED_STATUSES: Map<string, string[]> = new Map([
  ['DRAFT', ['PENDING', 'HIDDEN']],
  ['PENDING', []],
  ['APPROVED', ['HIDDEN']],
  ['REJECTED', ['PENDING']],
  ['HIDDEN', ['DRAFT']],
]);

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  // Không trả id (UUID) trong list/public endpoints -> FE tự tính STT = index + 1 + page * size
  // Riêng ADMIN: trả thêm id để thao tác duyệt/cấm (admin là endpoint nội bộ, không public)
  private listSelect(viewerRole?: string) {
    const select: Prisma.RecipeSelect = {
      title: true,
      description: true,
      thumbnailUrl: true,
      cookTimeMinutes: true,
      prepTimeMinutes: true,
      servings: true,
      status: true,
      source: true,
      rejectionReason: true,
      createdAt: true,
      updatedAt: true,
    };
    // Spec recipes/README.md "GET /recipes (List - KHÔNG CÓ ID)": danh sách công khai
    // cố tình KHÔNG trả id để chống dò/enum UUID sang endpoint chi tiết.
    // Chỉ ADMIN (đã đăng nhập) mới thấy id + author để quản trị.
    if (viewerRole === Role.ADMIN) {
      select.id = true;
      select.author = { select: { displayName: true, email: true } };
    }
    return select;
  }

  async findAll(query: RecipeQueryDto, viewerRole?: string) {
    const page = query.page ?? 0;
    const size = query.size ?? 20;

    const where: Prisma.RecipeWhereInput = { deletedAt: null };

    if ((viewerRole === undefined || viewerRole === 'USER') && !query.status) {
      where.status = 'APPROVED';
    } else if (query.status) {
      where.status = query.status;
    }
    // ViewerRole = ADMIN và không lọc status -> xem tất cả trạng thái (chưa xóa)

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { ingredients: { some: { originalText: { contains: query.search } } } },
      ];
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.tagNames?.length) {
      where.tags = { some: { name: { in: query.tagNames } } };
    }

    const [content, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { [query.sortBy]: query.sortDirection },
        select: this.listSelect(viewerRole),
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async findOne(id: string, viewer?: { id?: string; role?: string }) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: { select: { displayName: true, email: true } },
        category: { select: { name: true, slug: true } },
        tags: { select: { name: true } },
        ingredients: { include: { internalIngredient: { select: { canonicalName: true } } } },
        steps: true,
        nutrition: true,
      },
    });
    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException('[REC-06] Công thức không tồn tại');
    }
    // BR-02: chỉ APPROVED mới công khai. ADMIN xem được mọi trạng thái để kiểm duyệt,
    // tác giả xem được mọi trạng thái của chính mình (để sửa / xem lý do bị reject).
    const isAdmin = viewer?.role === Role.ADMIN;
    const isAuthor = !!viewer?.id && recipe.authorId === viewer.id;
    if (!isAdmin && !isAuthor && recipe.status !== 'APPROVED') {
      throw new NotFoundException('[REC-06] Công thức không tồn tại');
    }
    return recipe;
  }

  async create(dto: CreateRecipeDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          title: dto.title,
          description: dto.description,
          thumbnailUrl: dto.thumbnailUrl,
          cookTimeMinutes: dto.cookTimeMinutes,
          prepTimeMinutes: dto.prepTimeMinutes,
          servings: dto.servings,
          status: 'DRAFT',
          authorId: userId,
          categoryId: dto.categoryId,
          tags: dto.tagNames?.length
            ? {
                connectOrCreate: dto.tagNames.map((name) => ({
                  where: { name },
                  create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
                })),
              }
            : undefined,
          ingredients: {
            create: dto.ingredients.map((item, index) => ({
              originalText: item.originalText,
              quantity: item.quantity,
              unit: item.unit,
              sortOrder: index + 1,
              internalIngredientId: item.internalIngredientId,
            })),
          },
          steps: {
            create: dto.steps.map((step, index) => ({
              stepOrder: index + 1,
              content: step.content,
              imageUrl: step.imageUrl,
            })),
          },
          nutrition: dto.nutrition ? { create: dto.nutrition } : undefined,
        },
        include: {
          ingredients: true,
          steps: true,
          nutrition: true,
          tags: true,
        },
      });

      // Chuẩn hóa nguyên liệu: map theo tên chuẩn hóa (NFD) nếu chưa chỉ định internalIngredientId
      await this.autoMapIngredients(tx, recipe.id);
      return recipe;
    });
  }

  async update(id: string, dto: Partial<CreateRecipeDto>, userId: string, role: string) {
    const existing = await this.findOneOwned(id, userId, role);

    const data: Prisma.RecipeUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.cookTimeMinutes !== undefined) data.cookTimeMinutes = dto.cookTimeMinutes;
    if (dto.prepTimeMinutes !== undefined) data.prepTimeMinutes = dto.prepTimeMinutes;
    if (dto.servings !== undefined) data.servings = dto.servings;
    if (dto.categoryId !== undefined) data.category = { connect: { id: dto.categoryId } };
    if (dto.tagNames) {
      data.tags = {
        connectOrCreate: dto.tagNames.map((name) => ({
          where: { name },
          create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
        })),
      };
    }
    // Nội dung đổi mới -> trả về DRAFT duyệt lại (BR-02)
    if (dto.ingredients || dto.steps) {
      data.status = 'DRAFT';
      data.ingredients = dto.ingredients
        ? {
            deleteMany: {},
            create: dto.ingredients.map((item, index) => ({
              originalText: item.originalText,
              quantity: item.quantity,
              unit: item.unit,
              sortOrder: index + 1,
              internalIngredientId: item.internalIngredientId,
            })),
          }
        : undefined;
      data.steps = dto.steps
        ? {
            deleteMany: {},
            create: dto.steps.map((step, index) => ({
              stepOrder: index + 1,
              content: step.content,
              imageUrl: step.imageUrl,
            })),
          }
        : undefined;
    }
    if (dto.nutrition !== undefined) {
      data.nutrition = { upsert: { create: dto.nutrition, update: dto.nutrition } };
    }

    return this.prisma.recipe.update({ where: { id }, data });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findOneOwned(id, userId, role);
    // Soft delete (quy tắc DB: dùng deletedAt thay vì hard delete)
    await this.prisma.recipe.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async submitForReview(id: string, userId: string, role: string) {
    const existing = await this.findOneOwned(id, userId, role);
    const validNext = ALLOWED_STATUSES.get(existing.status) || [];
    if (!validNext.includes('PENDING')) {
      throw new BadRequestException(
        `[REC-07] Không thể gửi duyệt từ trạng thái ${existing.status} (chỉ DRAFT/REJECTED)`,
      );
    }
    return this.prisma.recipe.update({
      where: { id },
      data: { status: 'PENDING' as RecipeStatus },
    });
  }

  async autoMapIngredients(tx: Prisma.TransactionClient, recipeId: string) {
    const items = await tx.recipeIngredient.findMany({
      where: { recipeId, internalIngredientId: null },
    });

    for (const item of items) {
      const normalized = this.normalizeText(item.originalText);
      const candidate = await tx.internalIngredient.findFirst({
        where: { normalizedName: { contains: normalized } },
      });
      if (candidate) {
        await tx.recipeIngredient.update({
          where: { id: item.id },
          data: { internalIngredientId: candidate.id },
        });
      }
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  private async findOneOwned(id: string, userId: string, role: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException('[REC-06] Công thức không tồn tại');
    }
    if (recipe.authorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('[REC-08] Không có quyền thao tác công thức này');
    }
    return recipe;
  }
}