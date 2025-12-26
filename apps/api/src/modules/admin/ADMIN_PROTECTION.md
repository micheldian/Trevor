# Admin Protection System

Complete IP-based protection system for admin endpoints with rate limiting and automatic IP locking.

## Features

- **Rate Limiting**: IP-based request throttling for admin endpoints
- **IP Locking**: Automatic IP blocking after repeated failed attempts
- **Sensitive Actions**: Extra protection for critical operations
- **Manual IP Management**: Admin endpoints to view and unlock IPs
- **Redis-Backed**: Distributed tracking across multiple servers

## Architecture

### Components

1. **AdminIpLockService** (`services/admin-ip-lock.service.ts`)
   - Redis-based tracking service
   - Rate limiting logic
   - IP lock management
   - Statistics and monitoring

2. **AdminRateLimitGuard** (`guards/admin-rate-limit.guard.ts`)
   - Enforces rate limits per IP
   - Returns 429 Too Many Requests when exceeded
   - Adds X-RateLimit-Remaining headers

3. **AdminIpLockGuard** (`guards/admin-ip-lock.guard.ts`)
   - Blocks requests from locked IPs
   - Returns 403 Forbidden with unlock time
   - Works with @SensitiveAction() decorator

4. **AdminFailureInterceptor** (`interceptors/admin-failure.interceptor.ts`)
   - Tracks 403 errors on sensitive actions
   - Auto-locks IPs after max attempts
   - Non-blocking (doesn't affect response)

5. **@SensitiveAction()** (`decorators/sensitive-action.decorator.ts`)
   - Marks routes requiring extra protection
   - Used by failure interceptor to track attempts

## Configuration

Add to `.env`:

```env
# Admin Rate Limiting
ADMIN_RATE_LIMIT=20        # Max requests per window
ADMIN_RATE_TTL=60          # Time window in seconds

# Admin IP Locking
ADMIN_MAX_FAILED_ATTEMPTS=5  # Failed attempts before lock
ADMIN_LOCK_DURATION=1800     # Lock duration in seconds (30 min)
```

### Default Values

| Variable | Default | Description |
|----------|---------|-------------|
| ADMIN_RATE_LIMIT | 20 | Maximum requests per time window |
| ADMIN_RATE_TTL | 60 | Time window in seconds |
| ADMIN_MAX_FAILED_ATTEMPTS | 5 | Failed attempts before auto-lock |
| ADMIN_LOCK_DURATION | 1800 | IP lock duration (30 minutes) |

## Usage

### Protecting Admin Controllers

Admin controllers are automatically protected:

```typescript
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, AdminIpLockGuard, AdminRateLimitGuard)
@UseInterceptors(AdminFailureInterceptor)
@Roles(Role.ADMIN)
export class AdminController {
  // All routes automatically protected
}
```

### Marking Sensitive Actions

Use `@SensitiveAction()` on critical operations:

```typescript
@Patch('users/:userId/suspend')
@SensitiveAction() // Extra protection: tracks failures
async suspendUser(
  @Param('userId') userId: string,
  @Body() body: { reason: string }
) {
  // Your logic here
}
```

**When to use `@SensitiveAction()`:**
- User suspension/deletion
- Role changes
- Force operations (force confirm, force cancel)
- Data deletion (reviews, jobs, matches)
- Security setting changes
- IP unlock operations

### Example: Protected Route

```typescript
@Delete('users/:userId')
@SensitiveAction() // Tracks failed attempts
@AuditLog({         // Logs successful actions
  action: 'user.deleted',
  entityType: 'user',
  entityIdParam: 'userId',
})
async deleteUser(@Param('userId') userId: string) {
  // Implementation
}
```

## How It Works

### 1. Rate Limiting Flow

```
Request → AdminRateLimitGuard
    ↓
Check Redis: admin:ip:ratelimit:{ip}
    ↓
Increment counter (TTL: ADMIN_RATE_TTL)
    ↓
Count > ADMIN_RATE_LIMIT?
    ↓ Yes
  429 Too Many Requests
    ↓ No
  Allow request
```

### 2. IP Lock Flow

```
Request → AdminIpLockGuard
    ↓
Check Redis: admin:ip:lock:{ip}
    ↓
IP locked?
    ↓ Yes
  403 Forbidden (with unlock time)
    ↓ No
  Continue to controller
    ↓
  Controller returns 403?
    ↓ Yes (and @SensitiveAction)
  AdminFailureInterceptor
    ↓
  Increment failed attempts
    ↓
  Attempts >= ADMIN_MAX_FAILED_ATTEMPTS?
    ↓ Yes
  Lock IP for ADMIN_LOCK_DURATION
```

### 3. Redis Keys

| Key Pattern | Purpose | TTL |
|------------|---------|-----|
| `admin:ip:lock:{ip}` | IP lock status | ADMIN_LOCK_DURATION |
| `admin:ip:ratelimit:{ip}` | Request count | ADMIN_RATE_TTL |
| `admin:ip:failed:{ip}` | Failed attempt count | ADMIN_LOCK_DURATION |

## Admin IP Management Endpoints

### Get All Locked IPs

```http
GET /admin/security/locked-ips
Authorization: Bearer {admin-jwt}
```

**Response:**
```json
{
  "count": 2,
  "lockedIps": [
    {
      "ip": "192.168.1.100",
      "isLocked": true,
      "failedAttempts": 5,
      "remainingRequests": 0,
      "timeUntilUnlock": 1245
    }
  ]
}
```

### Get IP Statistics

```http
GET /admin/security/ips/192.168.1.100/stats
Authorization: Bearer {admin-jwt}
```

**Response:**
```json
{
  "ip": "192.168.1.100",
  "isLocked": true,
  "failedAttempts": 5,
  "remainingRequests": 0,
  "timeUntilUnlock": 1245
}
```

### Unlock IP Address

```http
POST /admin/security/ips/192.168.1.100/unlock
Authorization: Bearer {admin-jwt}
```

**Response:**
```json
{
  "success": true,
  "message": "IP 192.168.1.100 has been unlocked",
  "ip": "192.168.1.100"
}
```

## Response Headers

### Rate Limit Headers

```http
X-RateLimit-Remaining: 15
```

## Error Responses

### 429 Too Many Requests

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "remainingRequests": 0
}
```

### 403 Forbidden (IP Locked)

```json
{
  "statusCode": 403,
  "message": "Your IP address has been temporarily locked due to suspicious activity. Please try again in 25 minutes.",
  "timeUntilUnlock": 1500,
  "minutesRemaining": 25
}
```

## Security Best Practices

### 1. Configure for Production

```env
# Production settings (stricter)
ADMIN_RATE_LIMIT=10
ADMIN_RATE_TTL=60
ADMIN_MAX_FAILED_ATTEMPTS=3
ADMIN_LOCK_DURATION=3600
```

### 2. Monitor Locked IPs

Regularly check locked IPs dashboard:
```bash
curl -H "Authorization: Bearer $ADMIN_JWT" \
  https://api.example.com/admin/security/locked-ips
```

### 3. Whitelist Internal IPs (if needed)

For internal admin IPs, consider:
- Using VPN with dedicated IP range
- Implementing IP whitelist in guards
- Using separate admin subdomain with IP restrictions

### 4. Combine with Audit Logging

Always use both protections together:

```typescript
@Delete('reviews/:reviewId')
@SensitiveAction()           // IP protection
@AuditLog({                  // Audit trail
  action: 'review.deleted',
  entityType: 'review',
  entityIdParam: 'reviewId',
})
async deleteReview(...) { }
```

## Testing

### Test Rate Limiting

```bash
# Send 25 requests rapidly (should get 429 after 20)
for i in {1..25}; do
  curl -H "Authorization: Bearer $JWT" \
    https://api.example.com/admin/stats
  echo "Request $i"
done
```

### Test IP Locking

```bash
# Make 5 failed attempts on sensitive action
for i in {1..5}; do
  curl -X PATCH \
    -H "Authorization: Bearer $INVALID_JWT" \
    https://api.example.com/admin/users/123/suspend
done

# 6th request should return 403 Forbidden (IP locked)
```

### Test IP Unlock

```bash
# Unlock IP as admin
curl -X POST \
  -H "Authorization: Bearer $ADMIN_JWT" \
  https://api.example.com/admin/security/ips/192.168.1.100/unlock
```

## Troubleshooting

### Issue: Legitimate admin locked out

**Solution:** Unlock via another admin or Redis CLI:
```bash
redis-cli DEL admin:ip:lock:192.168.1.100
redis-cli DEL admin:ip:failed:192.168.1.100
```

### Issue: Rate limit too strict

**Solution:** Adjust configuration:
```env
ADMIN_RATE_LIMIT=50     # Increase limit
ADMIN_RATE_TTL=120      # Increase window
```

### Issue: Behind load balancer, wrong IP tracked

**Solution:** Ensure X-Forwarded-For header is set correctly by load balancer.
Guards automatically extract IP from this header.

### Issue: Need to disable temporarily

**Solution:** Comment out guards in controller:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard) // Removed IP guards
export class AdminController { }
```

## Integration with Existing Features

### Works with RBAC

```typescript
@UseGuards(
  JwtAuthGuard,        // 1. Validate JWT
  RolesGuard,          // 2. Check role
  AdminIpLockGuard,    // 3. Check IP lock
  AdminRateLimitGuard  // 4. Check rate limit
)
```

### Works with Audit Log

```typescript
@SensitiveAction()    // IP protection
@AuditLog({...})      // Audit trail
```

## Metrics and Monitoring

### Key Metrics to Track

1. **Locked IPs per day**: Spikes indicate attack or misconfiguration
2. **Failed attempts by IP**: Identify brute force attempts
3. **Rate limit violations**: Normal traffic or DDoS?
4. **Average unlock requests**: Legitimate users affected?

### Redis Monitoring

```bash
# Check locked IPs
redis-cli KEYS "admin:ip:lock:*"

# Check failed attempts
redis-cli GET "admin:ip:failed:192.168.1.100"

# Check rate limit
redis-cli GET "admin:ip:ratelimit:192.168.1.100"
```

## Future Enhancements

- [ ] IP whitelist for trusted admin IPs
- [ ] Email notifications for locked IPs
- [ ] Geolocation-based blocking
- [ ] Progressive rate limiting (slower after violations)
- [ ] Admin dashboard for real-time monitoring
- [ ] Configurable lock duration per action type
