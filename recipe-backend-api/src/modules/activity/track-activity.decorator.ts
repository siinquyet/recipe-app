import { SetMetadata } from '@nestjs/common';

export type ActivityType = 'VIEW' | 'FAVORITE' | 'RATE' | 'COMMENT' | 'SHARE' | 'CREATE_RECIPE' | 'GENERATE_SHOPPING';
export type EntityType = 'RECIPE' | 'RECIPE_REFERENCE' | 'SHOPPING_LIST';

export interface TrackActivityOptions {
  entityType: EntityType;
  entityIdParam?: string; // default 'id'
}

export const ACTIVITY_METADATA_KEY = 'activity';

export const TrackActivity = (type: ActivityType, entityType: EntityType, options?: Omit<TrackActivityOptions, 'entityType'>) => {
  return SetMetadata(ACTIVITY_METADATA_KEY, {
    type,
    entityType,
    entityIdParam: options?.entityIdParam ?? 'id',
  });
};