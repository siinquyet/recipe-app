import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInternalIngredientDto,
  CreateIngredientMappingDto,
  IngredientQueryDto,
} from './dto/ingredient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  // --- InternalIngredient ---

  private normalize(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  async findAllIngredients(query: IngredientQueryDto) {
    const page = query.page ?? 0;
    const size = query.size ?? 20;

    const where: Prisma.InternalIngredientWhereInput = {};

    if (query.search) {
      where.OR = [
        { canonicalName: { contains: query.search } },
        { normalizedName: { contains: query.search } },
      ];
    }
    if (query.category) {
      where.category = query.category;
    }

    const [content, total] = await Promise.all([
      this.prisma.internalIngredient.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { canonicalName: 'asc' },
      }),
      this.prisma.internalIngredient.count({ where }),
    ]);

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async findOneIngredient(id: string) {
    const item = await this.prisma.internalIngredient.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('[ING-01] Nguyên liệu không tồn tại');
    }
    return item;
  }

  async createIngredient(dto: CreateInternalIngredientDto) {
    const normalizedName = dto.normalizedName || this.normalize(dto.canonicalName);

    const existing = await this.prisma.internalIngredient.findFirst({
      where: { normalizedName },
    });
    if (existing) {
      throw new ConflictException('[ING-02] Nguyên liệu đã tồn tại (trùng tên chuẩn hóa)');
    }

    return this.prisma.internalIngredient.create({
      data: {
        canonicalName: dto.canonicalName,
        normalizedName,
        category: dto.category,
        unitCategory: (dto.unitCategory as any) || 'COUNT',
        defaultUnit: dto.defaultUnit || 'g',
      },
    });
  }

  async updateIngredient(id: string, dto: Partial<CreateInternalIngredientDto>) {
    await this.findOneIngredient(id);

    const data: Prisma.InternalIngredientUpdateInput = {};
    if (dto.canonicalName) {
      data.canonicalName = dto.canonicalName;
      data.normalizedName = dto.normalizedName || this.normalize(dto.canonicalName);
    }
    if (dto.category) data.category = dto.category;
    if (dto.unitCategory) data.unitCategory = dto.unitCategory as any;
    if (dto.defaultUnit) data.defaultUnit = dto.defaultUnit;

    return this.prisma.internalIngredient.update({ where: { id }, data });
  }

  async removeIngredient(id: string) {
    await this.findOneIngredient(id);
    return this.prisma.internalIngredient.delete({ where: { id } });
  }

  // --- IngredientMapping ---

  async findAllMappings(query: IngredientQueryDto) {
    const page = query.page ?? 0;
    const size = query.size ?? 20;

    const where: Prisma.IngredientMappingWhereInput = {};

    if (query.search) {
      where.externalName = { contains: query.search };
    }

    const [content, total] = await Promise.all([
      this.prisma.ingredientMapping.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { internalIngredient: { select: { id: true, canonicalName: true } } },
      }),
      this.prisma.ingredientMapping.count({ where }),
    ]);

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async createMapping(dto: CreateIngredientMappingDto) {
    await this.findOneIngredient(dto.internalIngredientId);

    const existing = await this.prisma.ingredientMapping.findFirst({
      where: {
        source: (dto.source || 'SPOONACULAR') as any,
        externalName: dto.externalName,
      },
    });
    if (existing) {
      throw new ConflictException('[ING-03] Mapping đã tồn tại cho external name này');
    }

    return this.prisma.ingredientMapping.create({
      data: {
        internalIngredientId: dto.internalIngredientId,
        externalName: dto.externalName,
        source: (dto.source || 'SPOONACULAR') as any,
        confidence: dto.confidence ?? 1.0,
      },
      include: { internalIngredient: { select: { id: true, canonicalName: true } } },
    });
  }

  async resolveMapping(source: string, externalName: string) {
    return this.prisma.ingredientMapping.findFirst({
      where: {
        source: source as any,
        externalName,
        status: 'MAPPED',
      },
      include: { internalIngredient: true },
    });
  }
}
