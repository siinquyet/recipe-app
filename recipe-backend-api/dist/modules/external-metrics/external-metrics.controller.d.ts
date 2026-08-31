import { ExternalMetricsService } from './external-metrics.service';
declare class UpsertMetricsDto {
    spoonacularScore?: number;
    healthScore?: number;
    aggregateLikes?: number;
}
export declare class ExternalMetricsController {
    private readonly service;
    constructor(service: ExternalMetricsService);
    find(id: string): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
    upsert(id: string, dto: UpsertMetricsDto): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        spoonacularScore: number | null;
        healthScore: number | null;
        aggregateLikes: number | null;
        lastSyncedAt: Date;
        recipeReferenceId: string;
    }>;
}
export {};
