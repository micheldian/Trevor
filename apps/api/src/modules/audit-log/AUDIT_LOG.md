# Audit Log System

Complete audit logging system for tracking important actions in the Trevor platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Components](#components)
- [Usage](#usage)
- [Examples](#examples)
- [Querying Logs](#querying-logs)
- [Best Practices](#best-practices)

## Overview

The audit log system tracks all critical actions performed in the platform, especially admin actions. Each log entry contains:

- **Who** (actor_user_id)
- **What** (action)
- **When** (created_at)
- **Where** (ip_address, request_url)
- **Before/After** (JSON snapshots)
- **Context** (metadata)

## Database Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(100),              -- e.g., 'user.verified', 'job.cancelled'
  entity_type VARCHAR(50),          -- e.g., 'user', 'job', 'match'
  entity_id UUID,
  before_json JSONB,                -- Entity state before action
  after_json JSONB,                 -- Entity state after action
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,
  metadata JSONB,                   -- Additional context
  status VARCHAR(20),               -- 'success', 'failed', 'partial'
  error_message TEXT,
  created_at TIMESTAMP
);
```

**Indexes:**
- `actor_user_id` - Find actions by user
- `entity_type + entity_id` - Find actions on specific entity
- `action` - Filter by action type
- `created_at` - Time-based queries
- GIN indexes on JSON columns for deep searches

## Components

### 1. AuditLog Entity

```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_user_id' })
  actorUserId: string;

  @Column()
  action: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'before_json', type: 'jsonb' })
  beforeJson: Record<string, any>;

  @Column({ name: 'after_json', type: 'jsonb' })
  afterJson: Record<string, any>;

  // ... more fields
}
```

### 2. AuditLogService

Provides methods to create and query audit logs:

```typescript
class AuditLogService {
  // Create audit log
  create(dto: CreateAuditLogDto): Promise<AuditLog>

  // Helper methods
  logUserVerification(actorUserId, targetUserId, before, after, request)
  logUserSuspension(actorUserId, targetUserId, reason, before, after, request)
  logReviewDeletion(actorUserId, reviewId, reviewData, reason, request)
  logJobCancellation(actorUserId, jobId, reason, before, after, request)
  logMatchConfirmation(actorUserId, matchId, before, after, request)
  logRoleChange(actorUserId, targetUserId, oldRole, newRole, request)
  logAction(action, entityType, entityId, actorUserId, before, after, request, metadata)

  // Query methods
  findByEntity(entityType, entityId): Promise<AuditLog[]>
  findByActor(actorUserId): Promise<AuditLog[]>
  findRecent(limit): Promise<AuditLog[]>
  findByAction(action): Promise<AuditLog[]>
}
```

### 3. @AuditLog() Decorator

Marks methods for automatic audit logging:

```typescript
@AuditLog({
  action: 'user.verified',
  entityType: 'user',
  entityIdParam: 'userId',
  includeResult: true,
  includeParams: false,
})
@Patch('users/:userId/verify')
async verifyUser(@Param('userId') userId: string) { ... }
```

### 4. AuditLogInterceptor

Automatically captures and logs decorated methods:

```typescript
@UseInterceptors(AuditLogInterceptor)
export class AdminController {
  // All routes in this controller will be audited
}
```

## Usage

### Method 1: Using @AuditLog() Decorator (Recommended)

Apply decorator to methods that should be audited:

```typescript
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../audit-log/interceptors/audit-log.interceptor';

@Controller('admin')
@UseInterceptors(AuditLogInterceptor) // Enable auditing for this controller
export class AdminController {

  @Patch('users/:userId/verify')
  @AuditLog({
    action: 'user.verified',
    entityType: 'user',
    entityIdParam: 'userId',
    includeResult: true,
  })
  async verifyUser(@Param('userId') userId: string, @Request() req) {
    // Your business logic
    return { success: true, userId };
  }
}
```

**Configuration Options:**

| Option | Type | Description |
|--------|------|-------------|
| `action` | string | Action name (e.g., 'user.verified') |
| `entityType` | string | Entity type (e.g., 'user', 'job') |
| `entityIdParam` | string | Parameter name containing entity ID |
| `includeResult` | boolean | Include method result in `afterJson` |
| `includeParams` | boolean | Include method params in `beforeJson` |

### Method 2: Manual Logging

Use the service directly for more control:

```typescript
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MyService {
  constructor(private auditLogService: AuditLogService) {}

  async suspendUser(userId: string, reason: string, req: Request) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const before = { ...user };

    user.isActive = false;
    await this.userRepository.save(user);

    const after = { ...user };

    // Manual audit log
    await this.auditLogService.logUserSuspension(
      req.user.sub,
      userId,
      reason,
      before,
      after,
      req,
    );

    return user;
  }
}
```

### Method 3: Generic Action Logging

For custom actions:

```typescript
await this.auditLogService.logAction(
  'custom.action',
  'entity_type',
  'entity_id',
  req.user.sub,
  { before: 'data' },
  { after: 'data' },
  req,
  { customMetadata: 'value' },
);
```

## Examples

### Example 1: User Verification

```typescript
@Patch('users/:userId/verify')
@AuditLog({
  action: 'user.verified',
  entityType: 'user',
  entityIdParam: 'userId',
  includeResult: true,
})
async verifyUser(@Param('userId') userId: string) {
  // Update user
  const user = await this.userService.verify(userId);
  return user;
}
```

**Resulting audit log:**
```json
{
  "id": "uuid",
  "actorUserId": "admin-user-id",
  "action": "user.verified",
  "entityType": "user",
  "entityId": "target-user-id",
  "afterJson": {
    "success": true,
    "userId": "target-user-id",
    "isVerified": true
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestMethod": "PATCH",
  "requestUrl": "/admin/users/xyz/verify",
  "status": "success",
  "createdAt": "2025-12-26T10:00:00Z"
}
```

### Example 2: Job Cancellation

```typescript
@Patch('jobs/:jobId/cancel')
@AuditLog({
  action: 'job.cancelled',
  entityType: 'job',
  entityIdParam: 'jobId',
  includeParams: true,
  includeResult: true,
})
async cancelJob(
  @Param('jobId') jobId: string,
  @Body() body: { reason: string },
) {
  const job = await this.jobService.cancel(jobId, body.reason);
  return { success: true, job };
}
```

**Resulting audit log:**
```json
{
  "actorUserId": "admin-user-id",
  "action": "job.cancelled",
  "entityType": "job",
  "entityId": "job-uuid",
  "beforeJson": {
    "jobId": "job-uuid",
    "reason": "Employer request"
  },
  "afterJson": {
    "success": true,
    "job": {
      "id": "job-uuid",
      "status": "cancelled",
      "cancelledAt": "2025-12-26T10:00:00Z"
    }
  },
  "status": "success"
}
```

### Example 3: Review Deletion

```typescript
@Delete('reviews/:reviewId')
@AuditLog({
  action: 'review.deleted',
  entityType: 'review',
  entityIdParam: 'reviewId',
  includeParams: true,
})
async deleteReview(
  @Param('reviewId') reviewId: string,
  @Body() body: { reason: string },
) {
  const review = await this.reviewService.delete(reviewId);
  return { success: true, reviewId };
}
```

### Example 4: Role Change (Manual Logging)

```typescript
async updateUserRole(userId: string, newRole: Role, req: Request) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  const oldRole = user.role;

  user.role = newRole;
  await this.userRepository.save(user);

  // Manual audit log
  await this.auditLogService.logRoleChange(
    req.user.sub,
    userId,
    oldRole,
    newRole,
    req,
  );

  return user;
}
```

## Querying Logs

### Admin Endpoints

All endpoints require ADMIN role:

```bash
# Get recent logs
GET /audit-logs?limit=50

# Get logs for specific entity
GET /audit-logs/entity/user/user-uuid

# Get logs by action type
GET /audit-logs/action/user.verified

# Get logs by actor (who did what)
GET /audit-logs/actor/admin-user-id
```

### Programmatic Queries

```typescript
// In a service
const logs = await this.auditLogService.findByEntity('user', userId);
const adminActions = await this.auditLogService.findByActor(adminUserId);
const recent = await this.auditLogService.findRecent(100);
```

### SQL Queries

```sql
-- Find all admin actions in last 24 hours
SELECT * FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Find who verified a specific user
SELECT actor_user_id, created_at, ip_address
FROM audit_logs
WHERE action = 'user.verified'
  AND entity_id = 'target-user-uuid';

-- Find all actions by a specific admin
SELECT action, entity_type, entity_id, created_at
FROM audit_logs
WHERE actor_user_id = 'admin-uuid'
ORDER BY created_at DESC
LIMIT 50;

-- Search in JSON data
SELECT * FROM audit_logs
WHERE after_json @> '{"status": "cancelled"}';
```

## Best Practices

### 1. What to Log

**DO log:**
- ✅ Admin actions (verify, suspend, delete)
- ✅ Role changes
- ✅ Permission changes
- ✅ Data deletion
- ✅ Financial transactions
- ✅ Security events

**DON'T log:**
- ❌ Normal CRUD operations by regular users
- ❌ Read-only operations (GET requests)
- ❌ Sensitive data (passwords, tokens)
- ❌ High-frequency events (every API call)

### 2. Action Naming Convention

Use dot notation: `entity.action`

```
user.verified
user.suspended
user.role_changed
job.cancelled
job.force_published
match.force_confirmed
review.deleted
payment.refunded
```

### 3. Before/After JSON

Include relevant fields only:

```typescript
// GOOD - Relevant fields
beforeJson: { status: 'published', isActive: true }
afterJson: { status: 'cancelled', isActive: false, cancelledAt: '2025...' }

// BAD - Too much data
beforeJson: { ...entireEntityWith50Fields }
```

### 4. Error Handling

Audit logging should never break the main flow:

```typescript
try {
  await this.auditLogService.create(dto);
} catch (error) {
  this.logger.error('Failed to create audit log', error);
  // Don't throw - continue with main operation
}
```

The `AuditLogService.create()` already handles this internally.

### 5. Performance

- Audit logging is asynchronous
- Uses separate database connection
- Won't slow down main operations
- Consider archiving old logs (>6 months)

### 6. Retention Policy

Recommended retention:

- **Critical actions:** 7 years (legal compliance)
- **Admin actions:** 3 years
- **Regular actions:** 1 year
- **Read operations:** 90 days

Implement with cron job:

```sql
-- Archive logs older than 3 years
CREATE TABLE audit_logs_archive AS
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '3 years';

DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '3 years';
```

## Action Types

### User Actions

```
user.verified          - Admin verified user account
user.suspended         - Admin suspended user
user.role_changed      - Admin changed user role
user.password_reset    - Admin reset user password
user.deleted           - Admin deleted user account
```

### Job Actions

```
job.cancelled          - Job cancelled (by admin or employer)
job.force_published    - Admin force-published a job
job.flagged            - Job flagged for review
job.unflagged          - Job unflagged after review
```

### Match Actions

```
match.confirmed        - Match confirmed by employer
match.force_confirmed  - Admin force-confirmed match
match.cancelled        - Match cancelled
```

### Review Actions

```
review.deleted         - Admin deleted a review
review.flagged         - Review flagged as inappropriate
review.verified        - Admin verified review authenticity
```

## Troubleshooting

### Logs not being created

1. Check interceptor is registered:
   ```typescript
   @UseInterceptors(AuditLogInterceptor)
   ```

2. Verify decorator is present:
   ```typescript
   @AuditLog({ action: '...', entityType: '...' })
   ```

3. Check AuditLogModule is imported in AppModule

### Missing request metadata

Ensure you're passing the `Request` object:

```typescript
await this.auditLogService.logAction(..., request); // ← Pass request
```

### Performance issues

- Add database indexes (already in migration)
- Archive old logs
- Limit JSON field sizes
- Use pagination when querying

## Summary

Trevor's audit log system provides:

- ✅ Complete audit trail of all critical actions
- ✅ Before/After snapshots for compliance
- ✅ IP and user agent tracking
- ✅ Easy decorator-based usage
- ✅ Flexible querying
- ✅ Admin-only access to logs
- ✅ Automatic error handling
- ✅ Performance-optimized

For questions, contact the Trevor development team.
