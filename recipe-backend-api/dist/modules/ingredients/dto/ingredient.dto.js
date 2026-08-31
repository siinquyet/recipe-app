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
exports.IngredientQueryDto = exports.CreateIngredientMappingDto = exports.CreateInternalIngredientDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateInternalIngredientDto {
}
exports.CreateInternalIngredientDto = CreateInternalIngredientDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'thịt bò' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInternalIngredientDto.prototype, "canonicalName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Để trống sẽ auto-normalize', example: 'thit bo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInternalIngredientDto.prototype, "normalizedName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['meat', 'vegetable', 'spice', 'dairy', 'grain', 'seafood', 'fruit', 'other'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInternalIngredientDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['MASS', 'VOLUME', 'COUNT'], default: 'COUNT' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['MASS', 'VOLUME', 'COUNT']),
    __metadata("design:type", String)
], CreateInternalIngredientDto.prototype, "unitCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'g' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInternalIngredientDto.prototype, "defaultUnit", void 0);
class CreateIngredientMappingDto {
}
exports.CreateIngredientMappingDto = CreateIngredientMappingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID InternalIngredient' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIngredientMappingDto.prototype, "internalIngredientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beef, ground' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIngredientMappingDto.prototype, "externalName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['SPOONACULAR'], default: 'SPOONACULAR' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['SPOONACULAR']),
    __metadata("design:type", String)
], CreateIngredientMappingDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1.0, description: 'Độ tin cậy 0-1' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateIngredientMappingDto.prototype, "confidence", void 0);
class IngredientQueryDto {
}
exports.IngredientQueryDto = IngredientQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngredientQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IngredientQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngredientQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], IngredientQueryDto.prototype, "size", void 0);
//# sourceMappingURL=ingredient.dto.js.map