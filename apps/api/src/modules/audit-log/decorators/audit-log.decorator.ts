import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for audit log decorator
 */
export const AUDIT_LOG_KEY = 'audit_log';

/**
 * Audit log configuration
 */
export interface AuditLogConfig {
  action: string;
  entityType: string;
  entityIdParam?: string; // Parameter name containing entity ID (e.g., 'userId', 'jobId')
  includeResult?: boolean; // Whether to include method result in afterJson
  includeParams?: boolean; // Whether to include method params in beforeJson
}

/**
 * Decorator to mark methods for audit logging
 *
 * @param config - Audit log configuration
 * @returns Metadata decorator
 *
 * @example
 * ```typescript
 * @AuditLog({
 *   action: 'user.suspended',
 *   entityType: 'user',
 *   entityIdParam: 'userId',
 * })
 * @Patch(':userId/suspend')
 * async suspendUser(@Param('userId') userId: string) { ... }
 * ```
 */
export const AuditLog = (config: AuditLogConfig) => SetMetadata(AUDIT_LOG_KEY, config);
