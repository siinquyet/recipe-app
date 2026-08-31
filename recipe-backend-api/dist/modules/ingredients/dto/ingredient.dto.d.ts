export declare class CreateInternalIngredientDto {
    canonicalName: string;
    normalizedName?: string;
    category?: string;
    unitCategory?: string;
    defaultUnit?: string;
}
export declare class CreateIngredientMappingDto {
    internalIngredientId: string;
    externalName: string;
    source?: string;
    confidence?: number;
}
export declare class IngredientQueryDto {
    search?: string;
    category?: string;
    page?: number;
    size?: number;
}
