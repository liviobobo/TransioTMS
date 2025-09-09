# Rate Limiting Configuration

## Overview
The application implements multi-tiered rate limiting to protect against abuse and ensure fair resource usage.

## Rate Limiters

### 1. General Limiter
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Applied to**: All endpoints except health checks
- **Purpose**: General protection against API abuse

### 2. Auth Limiter
- **Window**: 15 minutes
- **Limit**: 10 requests per IP
- **Applied to**: `/api/auth/*` endpoints
- **Purpose**: Protect against brute force login attempts

### 3. Admin Limiter (Custom)
- **Window**: 15 minutes
- **Limit**: 5 requests per IP
- **Applied to**: `/api/setari/*` endpoints
- **Purpose**: Strict limiting for admin operations

### 4. Backup Limiter (Custom)
- **Window**: 1 hour
- **Limit**: 3 requests per IP
- **Applied to**: Backup download endpoints
- **Purpose**: Prevent backup system abuse

### 5. Data Modification Limiter
- **Window**: 1 minute
- **Limit**: 20 requests per IP
- **Applied to**: CRUD operations (curse, soferi, vehicule, parteneri, facturi, uploads)
- **Purpose**: Prevent rapid data manipulation

## Implementation Details

- Uses express-rate-limit for standard rate limiting
- Uses custom createStrictRateLimit() for enhanced security on sensitive endpoints
- All violations are logged via the security logging system
- Rate limit exceeded responses include retry-after headers

## Monitoring

Rate limit violations are logged with:
- IP address
- Endpoint accessed
- Attempt count
- Timestamp
- User agent (if applicable)