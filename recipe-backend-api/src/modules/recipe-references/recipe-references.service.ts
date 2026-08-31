import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecipeReferenceQueryDto } from './dto/recipe-reference-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecipeReferencesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: RecipeReferenceQueryDto) {
    const page = query.page ?? 0;
    const size = query.size ?? 20;
    const { search, status, source, sort } = query;

    const where: Prisma.RecipeReferenceWhereInput = {};

    if (search) {
      where.title = { contains: search };
    }
    if (status) {
      where.status = status as any;
    }
    if (source) {
      where.source = source as any;
    }

    const [field, direction] = (sort || 'createdAt:desc').split(':');
    const orderBy = { [field]: direction as 'asc' | 'desc' };

    const [content, total] = await Promise.all([
      this.prisma.recipeReference.findMany({
        where,
        orderBy,
        skip: page * size,
        take: size,
        select: {
          id: true,
          source: true,
          externalId: true,
          title: true,
          imageUrl: true,
          servings: true,
          status: true,
          spoonacularScore: true,
          healthScore: true,
          aggregateLikes: true,
          lastSyncedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.recipeReference.count({ where }),
    ]);

    return {
      content,
      pageable: { pageNumber: page, pageSize: size },
      totalElements: total,
      totalPages: Math.ceil(total / (size || 20)),
    };
  }

  async findOne(id: string) {
    const ref = await this.prisma.recipeReference.findUnique({
      where: { id },
    });

    if (!ref) {
      throw new NotFoundException('[REF-01] Recipe reference không tồn tại');
    }

    return ref;
  }

  async findByExternal(source: string, externalId: string) {
    return this.prisma.recipeReference.findUnique({
      where: {
        source_externalId: { source: source as any, externalId },
      },
    });
  }

  async resolveOrCreate(source: string, externalId: string, data: {
    title: string;
    imageUrl?: string;
    servings?: number;
    spoonacularScore?: number;
    healthScore?: number;
    aggregateLikes?: number;
  }) {
    const existing = await this.findByExternal(source, externalId);

    if (existing) {
      return existing;
    }

    return this.prisma.recipeReference.create({
      data: {
        source: source as any,
        externalId,
        title: data.title,
        imageUrl: data.imageUrl,
        servings: data.servings || 4,
        spoonacularScore: data.spoonacularScore,
        healthScore: data.healthScore,
        aggregateLikes: data.aggregateLikes,
      },
    });
  }

  async markUnavailable(id: string) {
    const ref = await this.findOne(id);

    return this.prisma.recipeReference.update({
      where: { id },
      data: { status: 'UNAVAILABLE' },
    });
  }
}
