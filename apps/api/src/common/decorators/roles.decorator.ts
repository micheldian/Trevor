import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * Metadata key for roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 *
 * @param roles - One or more roles required to access the route
 * @returns Metadata decorator
 *
 * @example
 * ```typescript
 * @Roles(Role.ADMIN)
 * @Get('users')
 * getAllUsers() { ... }
 *
 * @Roles(Role.EMPLOYER, Role.ADMIN)
 * @Post('jobs')
 * createJob() { ... }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
