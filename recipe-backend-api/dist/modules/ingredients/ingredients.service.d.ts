import { PrismaService } from '../../prisma/prisma.service';
import { CreateInternalIngredientDto, CreateIngredientMappingDto, IngredientQueryDto } from './dto/ingredient.dto';
export declare class IngredientsService {
    private prisma;
    constructor(prisma: PrismaService);
    private normalize;
    findAllIngredients(query: IngredientQueryDto): Promise<{
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
    findOneIngredient(id: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    createIngredient(dto: CreateInternalIngredientDto): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    updateIngredient(id: string, dto: Partial<CreateInternalIngredientDto>): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    removeIngredient(id: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        canonicalName: string;
        normalizedName: string;
        unitCategory: import(".prisma/client").$Enums.UnitCategory;
        defaultUnit: string;
    }>;
    findAllMappings(query: IngredientQueryDto): Promise<{
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
    resolveMapping(source: string, externalName: string): Promise<({
        internalIngredient: {
            category: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            canonicalName: string;
            normalizedName: string;
            unitCategory: import(".prisma/client").$Enums.UnitCategory;
            defaultUnit: string;
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
    }) | null>;
}
