# Advanced Example - nestjs-moduly

This example demonstrates all features of the `nestjs-moduly` library.

## What It Demonstrates

- **Global Providers**: Infrastructure available globally
- **Scopes**: DEFAULT (singleton), REQUEST (per request), TRANSIENT (per injection)
- **External Services**: S3, Email, SMS, Queue, Analytics
- **Multiple Providers in Controller**: Repository + multiple external services
- **Helpers**: `getInjectionToken()`, `getAllInstances()`, `instanceGroupToArray()`

## How to Run

```bash
cd examples/03-advanced

npm install
npm run start:dev
```

The application will start at `http://localhost:3002`

## Testing the Endpoints

### Users
```bash
# List users
curl http://localhost:3002/users

# Create user (sends notification)
curl -X POST http://localhost:3002/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# View cache
curl http://localhost:3002/users/cache

# Clear cache
curl -X DELETE http://localhost:3002/users/cache

# View notifications
curl http://localhost:3002/users/notifications
```

### Products
```bash
# List products
curl http://localhost:3002/products

# Upload image to S3
curl -X POST http://localhost:3002/products/1/image

# Add to queue
curl -X POST http://localhost:3002/products/1/queue

# View cache
curl http://localhost:3002/products/cache

# Clear cache
curl -X DELETE http://localhost:3002/products/cache

# List S3 files
curl http://localhost:3002/products/s3

# View queue size
curl http://localhost:3002/products/queue-size
```

### Request Tracking (Demonstrating Scopes)
```bash
# Get request ID (REQUEST scope - changes each request)
curl http://localhost:3002/tracking/request-id

# Increment counter (TRANSIENT scope - new instance per injection)
curl http://localhost:3002/tracking/increment

# View counter (will always be 1 with TRANSIENT scope)
curl http://localhost:3002/tracking/count

# View analytics events
curl http://localhost:3002/tracking/events
```

## Key Files

- `instances.ts` - Instance groups and all instantiation
- `repositories/` - User, Product, RequestTracking repositories
- `services/` - Logger, Database, Cache, S3, Email, SMS, Queue, Analytics, Notification
- `user/user.controller.ts` - Uses Repository + Cache + Notification
- `product/product.controller.ts` - Uses Repository + Cache + S3 + Queue
- `request/request-tracking.controller.ts` - Uses Repository + Analytics
