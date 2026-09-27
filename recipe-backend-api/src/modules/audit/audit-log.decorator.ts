import { SetMetadata } from '@nestjs/common';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'HIDE'
  | 'UNHIDE'
  | 'BAN_USER'
  | 'ACTIVATE_USER'
  | 'CHANGE_ROLE'
  | 'SYNC_REFERENCE'
  | 'RESOLVE_REPORT'
  | string;

export type AuditEntityType = 'RECIPE' | 'USER' | 'RECIPE_REFERENCE' | 'INGREDIENT' | 'COMMENT' | 'REPORT' | string;

export interface AuditLogOptions {
  entityType: AuditEntityType;
  entityIdParam?: string; // default 'id'
  // derive action from req+res if needed
  action?: AuditAction | ((req: any, res: any) => AuditAction);
}

export const AUDIT_METADATA_KEY = 'audit';

export const AuditLog = (action: AuditAction | ((req: any, res: any) => AuditAction), entityType: AuditEntityType, options?: Omit<AuditLogOptions, 'entityType' | 'action'>) => {
  return SetMetadata(AUDIT_METADATA_KEY, {
    action,
    entityType,
    entityIdParam: options?.entityIdParam ?? 'id',
  });
};