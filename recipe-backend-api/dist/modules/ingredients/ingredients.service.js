"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IngredientsService = class IngredientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalize(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }
    async findAllIngredients(query) {
        const page = query.page ?? 0;
        const size = query.size ?? 20;
        const where = {};
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
    async findOneIngredient(id) {
        const item = await this.prisma.internalIngredient.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('[ING-01] Nguyên liệu không tồn tại');
        }
        return item;
    }
    async createIngredient(dto) {
        const normalizedName = dto.normalizedName || this.normalize(dto.canonicalName);
        const existing = await this.prisma.internalIngredient.findFirst({
            where: { normalizedName },
        });
        if (existing) {
            throw new common_1.ConflictException('[ING-02] Nguyên liệu đã tồn tại (trùng tên chuẩn hóa)');
        }
        return this.prisma.internalIngredient.create({
            data: {
                canonicalName: dto.canonicalName,
                normalizedName,
                category: dto.category,
                unitCategory: dto.unitCategory || 'COUNT',
                defaultUnit: dto.defaultUnit || 'g',
            },
        });
    }
    async updateIngredient(id, dto) {
        await this.findOneIngredient(id);
        const data = {};
        if (dto.canonicalName) {
            data.canonicalName = dto.canonicalName;
            data.normalizedName = dto.normalizedName || this.normalize(dto.canonicalName);
        }
        if (dto.category)
            data.category = dto.category;
        if (dto.unitCategory)
            data.unitCategory = dto.unitCategory;
        if (dto.defaultUnit)
            data.defaultUnit = dto.defaultUnit;
        return this.prisma.internalIngredient.update({ where: { id }, data });
    }
    async removeIngredient(id) {
        await this.findOneIngredient(id);
        return this.prisma.internalIngredient.delete({ where: { id } });
    }
    async findAllMappings(query) {
        const page = query.page ?? 0;
        const size = query.size ?? 20;
        const where = {};
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
    async createMapping(dto) {
        await this.findOneIngredient(dto.internalIngredientId);
        const existing = await this.prisma.ingredientMapping.findFirst({
            where: {
                source: (dto.source || 'SPOONACULAR'),
                externalName: dto.externalName,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('[ING-03] Mapping đã tồn tại cho external name này');
        }
        return this.prisma.ingredientMapping.create({
            data: {
                internalIngredientId: dto.internalIngredientId,
                externalName: dto.externalName,
                source: (dto.source || 'SPOONACULAR'),
                confidence: dto.confidence ?? 1.0,
            },
            include: { internalIngredient: { select: { id: true, canonicalName: true } } },
        });
    }
    async resolveMapping(source, externalName) {
        return this.prisma.ingredientMapping.findFirst({
            where: {
                source: source,
                externalName,
                status: 'MAPPED',
            },
            include: { internalIngredient: true },
        });
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map