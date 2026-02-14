# NestJS Moduly

[![NPM Version](https://img.shields.io/npm/v/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![License](https://img.shields.io/npm/l/nestjs-moduly.svg)](https://github.com/VictorlBueno/nestjs-moduly/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Compatible-red.svg)](https://nestjs.com/)

Simplify NestJS module management. Declare dependencies once, share singleton instances across modules, and inject with or without `@Inject()`.

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

### 2. Use as Providers

Use the declared instances in your modules:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { Repository } from './instances';

@Module({
  controllers: [UserController],
  providers: [
    Repository.Users,
  ],
})
export class AppModule {}
```

### 3. Inject Dependencies

Inject without `@Inject()`:

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

Or with `@Inject()` and external services:

```typescript
@Controller('products')
export class ProductController {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly emailService: IEmailService,
  ) {}

  @Post(':id/image')
  uploadImage(@Param('id') id: string, @Body() body: any) {
    const result = this.productRepository.uploadImage(id, body.imageData);
    this.emailService.send('admin@example.com', 'Product Image Uploaded', `Product ${id} image uploaded`);
    return result;
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

// Declare instances
Repository.Users = new UserRepository(database);
Repository.Products = new ProductRepository(database);
Database.Primary = new DatabaseService(config);
Storage.S3 = new S3Service(s3Config);
```

### Automatic Provider Wrapping

Each instance automatically becomes a NestJS provider:

```typescript
@Module({
  providers: [
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
  providers: [Database.Primary],
})
export class AppModule {}

// product.module.ts
@Module({
  providers: [Database.Primary],  // Same instance
})
export class ProductModule {}
```

### Dual Injection

**Natural Injection:**

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
  useClassAsToken: true,  // Enable dual injection
  global: false,
  scope: Scope.DEFAULT,
});
```

### .scope(scope)

Sets the injection scope for an instance.

```typescript
Repository.Users = new UserRepository(config);
Repository.Users.scope(Scope.REQUEST); // New instance per HTTP request
```

### Helpers

- **getInjectionToken(group, key)**: Get token for an instance
- **getAllInstances()**: Get all registered instances
- **instanceGroupToArray(group)**: Convert group to array
- **allInstanceGroupsToArray()**: Convert all groups to array

---

## Best Practices

### 1. Centralize Instance Declaration

Declare all instances in a single `instances.ts` file.

```typescript
// instances.ts
export const Database = createInstanceGroup('Database');
export const Repository = createInstanceGroup('Repository');

Database.Primary = new DatabaseService(config);
Repository.Users = new UserRepository(Database.Primary);
```

### 2. Use Interfaces

Define interfaces for your repositories and services.

```typescript
export interface IUserRepository {
  findAll(): any;
  findById(id: string): any;
}

export interface IEmailService {
  send(to: string, subject: string, body: string): any;
}
```

### 3. Inject Multiple Services

Controllers can inject both repositories and external services.

```typescript
@Controller('products')
export class ProductController {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly emailService: IEmailService,
    private readonly s3Service: IS3Service,
  ) {}
}
```

### 4. Use Scopes Appropriately

- **DEFAULT (Singleton)**: Database, Cache, Stateless services
- **REQUEST**: Request-specific data, user context
- **TRANSIENT**: Stateful services needing fresh instances

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
