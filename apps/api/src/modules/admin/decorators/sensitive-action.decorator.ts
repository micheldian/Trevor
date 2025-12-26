import { SetMetadata } from '@nestjs/common';

/**
 * Sensitive Action Decorator
 *
 * Marks admin routes that require extra protection:
 * - Stricter rate limiting
 * - Failed attempt tracking
 * - Automatic IP locking after repeated failures
 *
 * Use on actions like:
 * - User suspension/deletion
 * - Role changes
 * - Force operations
 * - Data deletion
 *
 * @example
 * @Patch('users/:userId/suspend')
 * @SensitiveAction()
 * async suspendUser(...) { ... }
 */
export const SENSITIVE_ACTION_KEY = 'sensitive_action';

export const SensitiveAction = () => SetMetadata(SENSITIVE_ACTION_KEY, true);
