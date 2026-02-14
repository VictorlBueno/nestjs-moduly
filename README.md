# NestJS Moduly

[![NPM Version](https://img.shields.io/npm/v/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![License](https://img.shields.io/npm/l/nestjs-moduly.svg)](https://github.com/VictorlBueno/nestjs-moduly/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Compatible-red.svg)](https://nestjs.com/)

Simplify NestJS module management. Declare dependencies once, share singleton instances across modules, and inject with or without `@Inject()`.

## Requirements

- NestJS 11.x or higher
- Node.js 16+

## Installation

```bash
npm install nestjs-moduly
```

```bash
yarn add nestjs-moduly
```

```bash
pnpm add nestjs-moduly
```

## Quick Start

### 1. Declare Dependencies

Create a file to declare all your instances once:

```typescript
// instances.ts
import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from './user.repository';
import { DatabaseService } from './database.service';

const database = new DatabaseService({ host: 'localhost', port: 5432 });

export const Repository = createInstanceGroup('Repository');
Repository.Users = new UserRepository(database);
```

### 2. Import in Modules

Use the declared instances in the `imports` array of your modules:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { Repository } from './instances';

@Module({
  imports: [
    Repository.Users,
  ],
  controllers: [UserController],
})
export class AppModule {}
```

### 3. Inject Dependencies

Inject using the concrete class type:

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  findAll() {
    return this.userRepository.findAll();
  }
}
```

---

## How It Works

### Instance Groups

Instance groups organize your dependencies into logical categories (Repository, Database, Infrastructure, etc.):

```typescript
export const Repository = createInstanceGroup('Repository');
export const Database = createInstanceGroup('Database');
export const Storage = createInstanceGroup('Storage');

Repository.Users = new UserRepository(database);
Repository.Products = new ProductRepository(database);
Database.Primary = new DatabaseService(config);
Storage.S3 = new S3Service(s3Config);
```

### Automatic Module Wrapping

Each instance automatically becomes a NestJS dynamic module. Use them in the `imports` array:

```typescript
@Module({
  imports: [
    Repository.Users,
    Database.Primary,
    Storage.S3,
  ],
})
export class AppModule {}
```

### Singleton Sharing

Instances are shared across your entire application. Declare once, use anywhere:

```typescript
// app.module.ts
@Module({
  imports: [Database.Primary],
})
export class AppModule {}

// product.module.ts
@Module({
  imports: [Database.Primary],  // Same singleton instance
})
export class ProductModule {}
```

### Dual Injection

**Natural Injection (recommended):**

```typescript
constructor(
  private userRepository: UserRepository,  // No @Inject() needed
) {}
```

**Flexible Injection (with @Inject()):**

```typescript
constructor(
  @Inject('Database.Primary') private primaryDb: DatabaseService,
  @Inject('Database.Replica') private replicaDb: DatabaseService,
) {}
```

---

## API Reference

### createInstanceGroup(name, options?)

Creates a new instance group.

```typescript
const Repository = createInstanceGroup('Repository', {
  useClassAsToken: true,  // Enable dual injection (default: true)
  global: false,          // Make available globally (default: false)
  scope: Scope.DEFAULT,   // Injection scope (default: Scope.DEFAULT)
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useClassAsToken` | `boolean` | `true` | Enables injection using the class constructor |
| `global` | `boolean` | `false` | Makes instances available without importing |
| `scope` | `Scope` | `Scope.DEFAULT` | Sets the injection scope |
| `tokenPrefix` | `string` | group name | Custom prefix for injection tokens |

### .scope(scope)

Sets the injection scope for an instance.

```typescript
Repository.Users = new UserRepository(config);
Repository.Users.scope(Scope.REQUEST); // New instance per HTTP request
```

### Helpers

- **getInjectionToken(group, key)**: Get token for an instance
- **getAllInstances()**: Get all registered instances as a Map
- **instanceGroupToArray(group)**: Convert a group to array of providers
- **allInstanceGroupsToArray()**: Convert all groups to array of providers

---

## Best Practices

### 1. Centralize Instance Declaration

Declare all instances in a single `instances.ts` file:

```typescript
// instances.ts
export const Database = createInstanceGroup('Database');
export const Repository = createInstanceGroup('Repository');

Database.Primary = new DatabaseService(config);
Repository.Users = new UserRepository(Database.Primary);
```

### 2. Use Imports, Not Providers

Always use `imports` to register instances:

```typescript
// Correct
@Module({
  imports: [Repository.Users, Database.Primary],
})

// Incorrect (will cause errors)
@Module({
  providers: [Repository.Users, Database.Primary],
})
```

### 3. Inject Using Concrete Classes

Use the concrete class type for injection, not interfaces:

```typescript
// Correct
constructor(private readonly userRepository: UserRepository) {}

// Incorrect (TypeScript interfaces don't exist at runtime)
constructor(private readonly userRepository: IUserRepository) {}
```

### 4. Use Scopes Appropriately

- **DEFAULT (Singleton)**: Database, Cache, Stateless services
- **REQUEST**: Request-specific data, user context
- **TRANSIENT**: Stateful services needing fresh instances

```typescript
// Request-scoped service
export const RequestContext = createInstanceGroup('RequestContext', {
  scope: Scope.REQUEST,
});
RequestContext.Context = new RequestContextService();
```

---

## Examples

See the `examples/` directory for complete working examples:

- **01-basic**: Simple repository setup
- **02-intermediate**: Multiple services, databases, and caching
- **03-advanced**: Global modules, scopes, and complex dependency chains

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Victor Bueno](https://github.com/VictorlBueno)

---

Built with [NestJS](https://nestjs.com/)
