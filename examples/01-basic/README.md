# Basic Example - nestjs-moduly

This example demonstrates the basic usage of the `nestjs-moduly` library.

## What It Demonstrates

- **Instance Groups**: Creating instance groups with `createInstanceGroup()`
- **Instantiation**: Creating instances with dependencies in `instances.ts`
- **Natural Injection**: Injecting dependencies without `@Inject()`
- **Singleton Pattern**: Same instance shared across the application

## How to Run

```bash
cd examples/01-basic

npm install
npm run start:dev
```

The application will start at `http://localhost:3000`

## Testing the Endpoints

```bash
# List all users
curl http://localhost:3000/users

# Get user by ID
curl http://localhost:3000/users/1

# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

## Key Files

- `instances.ts` - Instance groups and instantiation
- `repositories/user.repository.ts` - User repository
- `app.controller.ts` - REST controller
