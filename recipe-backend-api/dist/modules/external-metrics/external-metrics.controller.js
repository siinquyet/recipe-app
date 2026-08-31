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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalMetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const external_metrics_service_1 = require("./external-metrics.service");
class UpsertMetricsDto {
}
let ExternalMetricsController = class ExternalMetricsController {
    constructor(service) {
        this.service = service;
    }
    find(id) {
        return this.service.findByRecipeReference(id);
    }
    upsert(id, dto) {
        return this.service.upsert(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.ExternalMetricsController = ExternalMetricsController;
__decorate([
    (0, common_1.Get)(':recipeReferenceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy metrics theo recipe reference' }),
    __param(0, (0, common_1.Param)('recipeReferenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExternalMetricsController.prototype, "find", null);
__decorate([
    (0, common_1.Post)(':recipeReferenceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo/cập nhật metrics (upsert)' }),
    __param(0, (0, common_1.Param)('recipeReferenceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpsertMetricsDto]),
    __metadata("design:returntype", void 0)
], ExternalMetricsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':recipeReferenceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa metrics' }),
    __param(0, (0, common_1.Param)('recipeReferenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExternalMetricsController.prototype, "remove", null);
exports.ExternalMetricsController = ExternalMetricsController = __decorate([
    (0, swagger_1.ApiTags)('External Recipe Metrics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('external-metrics'),
    __metadata("design:paramtypes", [external_metrics_service_1.ExternalMetricsService])
], ExternalMetricsController);
//# sourceMappingURL=external-metrics.controller.js.map