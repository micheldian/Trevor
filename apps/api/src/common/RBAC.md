# RBAC (Role-Based Access Control) System

Complete implementation of Role-Based Access Control for the Trevor API.

## 📋 Table of Contents

- [Overview](#overview)
- [Roles](#roles)
- [Architecture](#architecture)
- [Setup](#setup)
- [Usage Examples](#usage-examples)
- [Admin Routes](#admin-routes)
- [Testing](#testing)
- [Migration](#migration)

## Overview

Trevor implements a simple yet powerful RBAC system with 4 roles:
- **Worker**: Individual agricultural workers
- **Team Lead**: Leaders of worker teams
- **Employer**: Employers posting jobs
- **Admin**: Platform administrators

The system integrates seamlessly with JWT authentication and provides route-level access control.

## Roles

### Role Enum

```typescript
export enum Role {
  WORKER = 'worker',
  TEAM_LEAD = 'team_lead',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}
```

**File:** `src/common/enums/role.enum.ts`

### Role Hierarchy

```typescript
export const ROLE_HIERARCHY = {
  [Role.WORKER]: 1,
  [Role.TEAM_LEAD]: 2,
  [Role.EMPLOYER]: 2,
  [Role.ADMIN]: 100,
};
```

- **Workers** and **Team Leads** have equal permissions by default
- **Employers** have same level as team leads
- **Admins** have highest privileges (100)

## Architecture

### Components

1. **Role Enum** (`common/enums/role.enum.ts`)
   - Defines available roles
   - Exported for use across the application

2. **@Roles() Decorator** (`common/decorators/roles.decorator.ts`)
   - Marks routes with required roles
   - Can specify multiple roles

3. **RolesGuard** (`common/guards/roles.guard.ts`)
   - Validates user's role against required roles
   - Registered globally in AppModule

4. **User Entity** (`modules/users/entities/user.entity.ts`)
   - Added `role` column (enum)
   - Defaults to `WORKER`

5. **JWT Integration** (`modules/auth/`)
   - Role included in JWT payload
   - Available in `request.user.role`

### Flow Diagram

```
Request → JwtAuthGuard → RolesGuard → Route Handler
           ↓              ↓
        Validates      Checks role
        JWT token      from @Roles()
        Adds user      decorator
        to request
```

## Setup

### 1. Database Migration

Run the migration to add the `role` column:

```bash
# Migration file: database/migrations/009_add_role_to_users.sql
psql -U your_user -d trevor_db -f database/migrations/009_add_role_to_users.sql
```

The migration:
- Creates `user_role` enum type
- Adds `role` column to `users` table
- Sets default role to `worker`
- Updates existing users based on their profiles

### 2. Guards Registration

Guards are already registered globally in `AppModule`:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // Step 1: Validate JWT
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard, // Step 2: Check roles
  },
],
```

**Important:** Guard order matters! JwtAuthGuard must run before RolesGuard.

## Usage Examples

### Example 1: Single Role

Protect a route for employers only:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobsController {

  @Post()
  @Roles(Role.EMPLOYER)
  async createJob(@Body() dto: CreateJobDto) {
    // Only employers can create jobs
    return this.jobsService.create(dto);
  }
}
```

### Example 2: Multiple Roles

Allow both employers and admins:

```typescript
@Post('jobs')
@Roles(Role.EMPLOYER, Role.ADMIN)
async createJob(@Body() dto: CreateJobDto) {
  // Employers and admins can create jobs
  return this.jobsService.create(dto);
}
```

### Example 3: No Role Restriction

If no `@Roles()` decorator is present, any authenticated user can access:

```typescript
@Get('profile')
async getProfile(@Request() req) {
  // Any authenticated user can access their profile
  return this.profileService.findOne(req.user.sub);
}
```

### Example 4: Controller-Level Protection

Protect entire controller:

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // All routes require ADMIN
export class AdminController {

  @Get('stats')
  async getStats() {
    // Only admins can access
    return this.adminService.getStats();
  }

  @Get('users')
  async getAllUsers() {
    // Only admins can access
    return this.adminService.getAllUsers();
  }
}
```

### Example 5: Accessing User Role

In controllers/services, access the user's role:

```typescript
@Get('dashboard')
async getDashboard(@Request() req) {
  const userRole = req.user.role; // From JWT payload

  switch (userRole) {
    case Role.WORKER:
      return this.dashboardService.getWorkerDashboard(req.user.sub);
    case Role.EMPLOYER:
      return this.dashboardService.getEmployerDashboard(req.user.sub);
    case Role.ADMIN:
      return this.dashboardService.getAdminDashboard(req.user.sub);
    default:
      throw new ForbiddenException('Unknown role');
  }
}
```

### Example 6: Conditional Logic

Show different data based on role:

```typescript
@Get('jobs/:id')
async getJob(@Param('id') id: string, @Request() req) {
  const job = await this.jobsService.findOne(id);

  // Employers can see applicant details, workers cannot
  if (req.user.role === Role.EMPLOYER || req.user.role === Role.ADMIN) {
    return {
      ...job,
      applicants: await this.jobsService.getApplicants(id),
    };
  }

  return job; // Workers see basic job info only
}
```

## Admin Routes

All routes under `/admin/**` are protected and require ADMIN role.

### Available Endpoints

```bash
# Get platform statistics
GET /admin/stats

# Get all users
GET /admin/users

# Update user role
PATCH /admin/users/:userId/role
Body: { "role": "employer" }

# Deactivate user
DELETE /admin/users/:userId

# Get all jobs (including drafts, cancelled)
GET /admin/jobs

# Get all matches
GET /admin/matches

# Get platform metrics
GET /admin/metrics
```

### Example Admin Request

```bash
# Must have ADMIN role in JWT
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "users": {
    "total": 150,
    "active": 142
  },
  "profiles": {
    "total": 138
  },
  "jobs": {
    "total": 45,
    "published": 32
  },
  "matches": {
    "total": 128
  },
  "requestedBy": {
    "userId": "admin-user-id",
    "role": "admin"
  }
}
```

## Testing

### Manual Testing

1. **Create a test admin user:**

```sql
-- Update an existing user to admin
UPDATE users
SET role = 'admin'
WHERE phone = '+33612345678';
```

2. **Login to get JWT:**

```bash
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'

curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678", "code": "123456"}'
```

3. **Test admin endpoint:**

```bash
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Unit Tests

Test the RolesGuard:

```typescript
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access if no roles specified', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ user: { role: Role.WORKER } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ user: { role: Role.ADMIN } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ user: { role: Role.WORKER } });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
```

## Migration

### Updating Existing Users

The migration automatically assigns roles based on existing profiles:

```sql
UPDATE users u
SET role = CASE
  WHEN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = u.id AND p.profile_type = 'team_lead'
  ) THEN 'team_lead'::user_role
  WHEN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = u.id AND p.profile_type = 'employer'
  ) THEN 'employer'::user_role
  ELSE 'worker'::user_role
END;
```

### Manual Role Assignment

Update a user's role:

```typescript
// In admin service
async updateUserRole(userId: string, newRole: Role) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  user.role = newRole;
  await this.userRepository.save(user);
  return user;
}
```

Or via SQL:

```sql
UPDATE users
SET role = 'admin'
WHERE id = 'user-uuid';
```

## Error Responses

### 403 Forbidden

When user doesn't have required role:

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: admin. Your role: worker",
  "error": "Forbidden"
}
```

### 401 Unauthorized

When JWT is missing or invalid (handled by JwtAuthGuard):

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Best Practices

1. **Always use both guards together:**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   ```

2. **Order matters:** JwtAuthGuard first, then RolesGuard

3. **Be specific with roles:** Use the minimum required role

4. **Log role changes:**
   ```typescript
   this.logger.log(`User ${userId} role updated from ${oldRole} to ${newRole}`);
   ```

5. **Don't hardcode roles:** Always use the `Role` enum

6. **Document protected routes:** Use Swagger `@ApiResponse` for 403 errors

## Troubleshooting

### Issue: Guard not working

**Solution:** Ensure guards are in correct order:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard) // Correct order
```

### Issue: Always getting 403

**Solution:** Check that role is in JWT payload:
```typescript
// In auth.service.ts
const payload: JwtPayload = {
  sub: user.id,
  role: user.role, // Make sure this is included
  // ...
};
```

### Issue: Role not updating

**Solution:** User needs to re-login to get new JWT with updated role.

## Files Reference

```
src/
├── common/
│   ├── enums/
│   │   └── role.enum.ts           # Role enum definition
│   ├── decorators/
│   │   └── roles.decorator.ts     # @Roles() decorator
│   ├── guards/
│   │   └── roles.guard.ts         # RolesGuard implementation
│   └── RBAC.md                    # This documentation
├── modules/
│   ├── auth/
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts  # JWT payload with role
│   │   └── auth.service.ts        # Includes role in tokens
│   ├── users/
│   │   └── entities/
│   │       └── user.entity.ts     # User with role column
│   └── admin/
│       ├── admin.controller.ts    # Admin routes example
│       ├── admin.service.ts
│       └── admin.module.ts
└── app.module.ts                  # Global guards registration

database/migrations/
└── 009_add_role_to_users.sql     # Migration for role column
```

## Summary

Trevor's RBAC system provides:
- ✅ 4 well-defined roles
- ✅ Simple `@Roles()` decorator
- ✅ Automatic JWT integration
- ✅ Global guard registration
- ✅ Controller and route-level protection
- ✅ Admin-only `/admin/**` routes
- ✅ Comprehensive error handling
- ✅ Easy to test and extend

For questions or issues, contact the Trevor development team.
