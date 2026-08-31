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
exports.RecipeReferencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recipe_references_service_1 = require("./recipe-references.service");
const recipe_reference_query_dto_1 = require("./dto/recipe-reference-query.dto");
let RecipeReferencesController = class RecipeReferencesController {
    constructor(service) {
        this.service = service;
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
};
exports.RecipeReferencesController = RecipeReferencesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách recipe references (phân trang)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recipe_reference_query_dto_1.RecipeReferenceQueryDto]),
    __metadata("design:returntype", void 0)
], RecipeReferencesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết recipe reference' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecipeReferencesController.prototype, "findOne", null);
exports.RecipeReferencesController = RecipeReferencesController = __decorate([
    (0, swagger_1.ApiTags)('Recipe References'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recipe-references'),
    __metadata("design:paramtypes", [recipe_references_service_1.RecipeReferencesService])
], RecipeReferencesController);
//# sourceMappingURL=recipe-references.controller.js.map