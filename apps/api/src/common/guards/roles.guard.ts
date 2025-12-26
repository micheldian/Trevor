import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard to check if user has required role(s) to access a route
 *
 * This guard:
 * - Reads roles metadata from @Roles() decorator
 * - Checks if user's role matches any of the required roles
 * - Throws ForbiddenException if user doesn't have permission
 * - Allows access if no @Roles() decorator is present
 *
 * @example
 * ```typescript
 * // In controller
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.ADMIN)
 * @Get('admin-only')
 * adminRoute() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request (added by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // User should exist (JWT guard should have validated)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's role is in the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role || 'none'}`,
      );
    }

    return true;
  }
}
