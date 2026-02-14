# Intermediate Example - nestjs-moduly

This example demonstrates intermediate usage of the `nestjs-moduly` library.

## What It Demonstrates

- **Multiple Instances**: Primary and Replica databases
- **External Services**: S3 storage and Email service
- **Multiple Providers in Controller**: Repository + external services
- **Singleton Sharing**: Same instance used across modules

## How to Run

```bash
cd examples/02-intermediate

npm install
npm run start:dev
```

The application will start at `http://localhost:3001`

## Testing the Endpoints

### Products
```bash
# List products
curl http://localhost:3001/products

# Upload image to S3
curl -X POST http://localhost:3001/products/1/image \
  -H "Content-Type: application/json" \
  -d '{"imageData": {"base64": "..."}}'

# Clear cache
curl -X DELETE http://localhost:3001/products/cache
```

### Orders
```bash
# List all orders
curl http://localhost:3001/orders

# Create an order
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# Send confirmation email
curl -X POST http://localhost:3001/orders/1/confirm-email \
  -H "Content-Type: application/json" \
  -d '{"customerEmail": "customer@example.com"}'

# Export order to S3
curl -X POST http://localhost:3001/orders/1/export
```

## Key Files

- `instances.ts` - Instance groups and all instantiation
- `repositories/` - Product and Order repositories
- `services/` - Database, Cache, S3, Email services
- `product/product.controller.ts` - Uses ProductRepository + EmailService
- `order/order.controller.ts` - Uses OrderRepository + S3Service
