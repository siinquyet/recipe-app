import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecipeStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModeratorActionDto, UserStatusDto } from './dto/admin-action.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, recipes, references, ingredients, pending] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.recipe.count({ where: { deletedAt: null } }),
      this.prisma.recipeReference.count(),
      this.prisma.internalIngredient.count(),
      this.prisma.recipe.count({ where: { status: 'PENDING', deletedAt: null } }),
    ]);

    // Phân bổ theo trạng thái công thức (BR-02)
    const byStatusRaw = await this.prisma.recipe.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    const byStatus = {
      DRAFT: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      HIDDEN: 0,
    };
    for (const row of byStatusRaw) {
      byStatus[row.status] = row._count._all;
    }

    const byRoleRaw = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    return {
      totalUsers: users,
      totalRecipes: recipes,
      totalRecipeReferences: references,
      totalIngredients: ingredients,
      pendingRecipes: pending,
      recipeStatusDistribution: byStatus,
      userRoleDistribution: { ADMIN: byRoleRaw.find((r) => r.role === 'ADMIN')?._count._all ?? 0, USER: byRoleRaw.find((r) => r.role === 'USER')?._count._all ?? 0 },
    };
  }

  async findAllUsers(query: { page?: number; size?: number; search?: string }) {
    const page = query.page ?? 0;
    const size = query.size ?? 20;

    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [{ email: { contains: query.search } }, { displayName: { contains: query.search } }];
    }

    const [content, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        // Không trả id (UUID) trong list/public endpoints -> FE tự tính STT
        select: {
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { recipes: true, comments: true, favorites: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async changeUserStatus(id: string, dto: UserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('[ADM-03] Người dùng không tồn tại');
    if (user.role === 'ADMIN') {
      throw new ConflictException('[ADM-04] Không thể khóa tài khoản ADMIN');
    }
    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: { email: true, displayName: true, role: true, status: true },
    });
  }

  // BR-02: Admin approve -> APPROVED
  async approveRecipe(id: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException('[REC-06] Công thức không tồn tại');
    if (recipe.status !== 'PENDING') {
      throw new ConflictException('[ADM-05] Chỉ duyệt được công thức ở trạng thái PENDING');
    }
    return this.prisma.recipe.update({
      where: { id },
      data: { status: 'APPROVED' as RecipeStatus, rejectionReason: null },
      select: { title: true, status: true },
    });
  }

  // BR-02: Admin reject -> REJECTED + lý do
  async rejectRecipe(id: string, dto: ModeratorActionDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException('[REC-06] Công thức không tồn tại');
    if (recipe.status !== 'PENDING') {
      throw new ConflictException('[ADM-05] Chỉ từ chối được công thức ở trạng thái PENDING');
    }
    return this.prisma.recipe.update({
      where: { id },
      data: { status: 'REJECTED' as RecipeStatus, rejectionReason: dto.reason || null },
      select: { title: true, status: true, rejectionReason: true },
    });
  }

  // BR-02: Admin hide -> HIDDEN (ẩn bài vi phạm đã duyệt)
  async hideRecipe(id: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException('[REC-06] Công thức không tồn tại');
    if (!['APPROVED', 'REJECTED'].includes(recipe.status)) {
      throw new ConflictException('[ADM-06] Chỉ ẩn công thức APPROVED hoặc REJECTED');
    }
    return this.prisma.recipe.update({
      where: { id },
      data: { status: 'HIDDEN' as RecipeStatus },
      select: { title: true, status: true },
    });
  }
}