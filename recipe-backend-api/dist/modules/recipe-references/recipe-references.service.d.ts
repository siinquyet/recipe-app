import { PrismaService } from '../../prisma/prisma.service';
import { RecipeReferenceQueryDto } from './dto/recipe-reference-query.dto';
export declare class RecipeReferencesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findByExternal(source: string, externalId: string): Promise<{
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
    } | null>;
    resolveOrCreate(source: string, externalId: string, data: {
        title: string;
        imageUrl?: string;
        servings?: number;
        spoonacularScore?: number;
        healthScore?: number;
        aggregateLikes?: number;
    }): Promise<{
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
    markUnavailable(id: string): Promise<{
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
