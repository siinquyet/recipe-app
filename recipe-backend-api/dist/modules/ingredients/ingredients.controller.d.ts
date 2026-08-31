import { IngredientsService } from './ingredients.service';
import { CreateInternalIngredientDto, CreateIngredientMappingDto, IngredientQueryDto } from './dto/ingredient.dto';
export declare class IngredientsController {
    private readonly service;
    constructor(service: IngredientsService);
    findAll(query: IngredientQueryDto): Promise<{
        content: {
            category: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            canonicalName: string;
            normalizedName: string;
            unitCategory: import(".prisma/client").$Enums.UnitCategory;
            defaultUnit: string;
        }[];
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
        totalElements: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    create(dto: CreateInternalIngredientDto): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    update(id: string, dto: Partial<CreateInternalIngredientDto>): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    remove(id: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    findMappings(query: IngredientQueryDto): Promise<{
        content: ({
            internalIngredient: {
                id: string;
                canonicalName: string;
            };
        } & {
            status: import(".prisma/client").$Enums.IngredientMappingStatus;
            source: import(".prisma/client").$Enums.RecipeSource;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            internalIngredientId: string;
            externalName: string;
            confidence: number;
        })[];
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
        totalElements: number;
        totalPages: number;
    }>;
    createMapping(dto: CreateIngredientMappingDto): Promise<{
        internalIngredient: {
            id: string;
            canonicalName: string;
        };
    } & {
        status: import(".prisma/client").$Enums.IngredientMappingStatus;
        source: import(".prisma/client").$Enums.RecipeSource;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        internalIngredientId: string;
        externalName: string;
        confidence: number;
    }>;
}
