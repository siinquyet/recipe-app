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
exports.ExternalMetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ExternalMetricsService = class ExternalMetricsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRecipeReference(recipeReferenceId) {
        const metrics = await this.prisma.externalRecipeMetrics.findUnique({
            where: { recipeReferenceId },
        });
        if (!metrics) {
            throw new common_1.NotFoundException('[MET-01] Chưa có metrics cho recipe reference này');
        }
        return metrics;
    }
    async upsert(recipeReferenceId, data) {
        return this.prisma.externalRecipeMetrics.upsert({
            where: { recipeReferenceId },
            create: { recipeReferenceId, ...data },
            update: { ...data, lastSyncedAt: new Date() },
        });
    }
    async remove(recipeReferenceId) {
        return this.prisma.externalRecipeMetrics.delete({
            where: { recipeReferenceId },
        });
    }
};
exports.ExternalMetricsService = ExternalMetricsService;
exports.ExternalMetricsService = ExternalMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExternalMetricsService);
//# sourceMappingURL=external-metrics.service.js.map