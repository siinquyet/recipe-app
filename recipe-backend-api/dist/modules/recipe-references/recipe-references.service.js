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
exports.RecipeReferencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecipeReferencesService = class RecipeReferencesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 0;
        const size = query.size ?? 20;
        const { search, status, source, sort } = query;
        const where = {};
        if (search) {
            where.title = { contains: search };
        }
        if (status) {
            where.status = status;
        }
        if (source) {
            where.source = source;
        }
        const [field, direction] = (sort || 'createdAt:desc').split(':');
        const orderBy = { [field]: direction };
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
    async findOne(id) {
        const ref = await this.prisma.recipeReference.findUnique({
            where: { id },
        });
        if (!ref) {
            throw new common_1.NotFoundException('[REF-01] Recipe reference không tồn tại');
        }
        return ref;
    }
    async findByExternal(source, externalId) {
        return this.prisma.recipeReference.findUnique({
            where: {
                source_externalId: { source: source, externalId },
            },
        });
    }
    async resolveOrCreate(source, externalId, data) {
        const existing = await this.findByExternal(source, externalId);
        if (existing) {
            return existing;
        }
        return this.prisma.recipeReference.create({
            data: {
                source: source,
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
    async markUnavailable(id) {
        const ref = await this.findOne(id);
        return this.prisma.recipeReference.update({
            where: { id },
            data: { status: 'UNAVAILABLE' },
        });
    }
};
exports.RecipeReferencesService = RecipeReferencesService;
exports.RecipeReferencesService = RecipeReferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipeReferencesService);
//# sourceMappingURL=recipe-references.service.js.map