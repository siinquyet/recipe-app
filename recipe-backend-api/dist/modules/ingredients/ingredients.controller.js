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
exports.IngredientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ingredients_service_1 = require("./ingredients.service");
const ingredient_dto_1 = require("./dto/ingredient.dto");
let IngredientsController = class IngredientsController {
    constructor(service) {
        this.service = service;
    }
    findAll(query) {
        return this.service.findAllIngredients(query);
    }
    findOne(id) {
        return this.service.findOneIngredient(id);
    }
    create(dto) {
        return this.service.createIngredient(dto);
    }
    update(id, dto) {
        return this.service.updateIngredient(id, dto);
    }
    remove(id) {
        return this.service.removeIngredient(id);
    }
    findMappings(query) {
        return this.service.findAllMappings(query);
    }
    createMapping(dto) {
        return this.service.createMapping(dto);
    }
};
exports.IngredientsController = IngredientsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách nguyên liệu nội bộ (phân trang)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingredient_dto_1.IngredientQueryDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết nguyên liệu nội bộ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm nguyên liệu nội bộ mới' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingredient_dto_1.CreateInternalIngredientDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật nguyên liệu nội bộ' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa nguyên liệu nội bộ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách mapping nguyên liệu' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingredient_dto_1.IngredientQueryDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "findMappings", null);
__decorate([
    (0, common_1.Post)('mappings'),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm mapping nguyên liệu' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingredient_dto_1.CreateIngredientMappingDto]),
    __metadata("design:returntype", void 0)
], IngredientsController.prototype, "createMapping", null);
exports.IngredientsController = IngredientsController = __decorate([
    (0, swagger_1.ApiTags)('Ingredients'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ingredients'),
    __metadata("design:paramtypes", [ingredients_service_1.IngredientsService])
], IngredientsController);
//# sourceMappingURL=ingredients.controller.js.map