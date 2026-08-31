import { PrismaService } from '../../prisma/prisma.service';
export declare class ExternalMetricsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByRecipeReference(recipeReferenceId: string): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
    upsert(recipeReferenceId: string, data: {
        spoonacularScore?: number;
        healthScore?: number;
        aggregateLikes?: number;
    }): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
    remove(recipeReferenceId: string): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
}
