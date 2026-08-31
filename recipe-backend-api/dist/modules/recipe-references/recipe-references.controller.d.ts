import { RecipeReferencesService } from './recipe-references.service';
import { RecipeReferenceQueryDto } from './dto/recipe-reference-query.dto';
export declare class RecipeReferencesController {
    private readonly service;
    constructor(service: RecipeReferencesService);
    findAll(query: RecipeReferenceQueryDto): Promise<{
        content: {
            title: string;
            status: import(".prisma/client").$Enums.ReferenceStatus;
            source: import(".prisma/client").$Enums.RecipeSource;
            id: string;
            externalId: string;
            imageUrl: string | null;
            servings: number;
            spoonacularScore: number | null;
            healthScore: number | null;
            aggregateLikes: number | null;
            lastSyncedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
        totalElements: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        title: string;
        status: import(".prisma/client").$Enums.ReferenceStatus;
        source: import(".prisma/client").$Enums.RecipeSource;
        id: string;
        externalId: string;
        imageUrl: string | null;
        servings: number;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
