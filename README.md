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

## Examples

Explore working examples demonstrating different levels of complexity:

- **[01 - Basic](./examples/01-basic)**: Simple usage with instance groups and natural injection
- **[02 - Intermediate](./examples/02-intermediate)**: Multiple instances, flexible injection, and feature modules
- **[03 - Advanced](./examples/03-advanced)**: All features including global providers, scopes, and helpers

See the [examples README](./examples/README.md) for detailed instructions on running each example.

## Quick Start

### 1. Declare Dependencies

Create a file to declare all your instances once:

```typescript
// instances.ts
import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from './user.repository';
import { AddressRepository } from './address.repository';
import { AwsKeyManager } from './aws-key-manager';

export const Repository = createInstanceGroup('Repository');
export const Service = createInstanceGroup('Service');

// Declare instances once
Repository.Users = new UserRepository(database);
Repository.Address = new AddressRepository(database);
Service.KeyManager = new AwsKeyManager(awsConfig);
```

### 2. Use as Providers

Use the declared instances in your modules:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { Repository, Service } from './instances';

@Module({
  providers: [
    Repository.Users,
    Repository.Address,
    Service.KeyManager,
  ],
})
export class AppModule {}
```

### 3. Inject Dependencies

Inject without `@Inject()` for single instances:

```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,  // Natural injection
  ) {}

  async getUser(id: string) {
    return this.userRepo.findUser(id);
  }
}
```

Or with `@Inject()` for multiple instances:

```typescript
@Injectable()
export class DataService {
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {}
}
```

---

## How It Works

### Instance Groups

Instance groups organize your dependencies into logical categories (Repository, Service, Infrastructure, etc.):

```typescript
export const Repository = createInstanceGroup('Repository');
export const Service = createInstanceGroup('Service');
export const Infrastructure = createInstanceGroup('Infrastructure');

// Declare instances
Repository.Users = new UserRepository(database);
Repository.Products = new ProductRepository(database);
Service.Email = new EmailService(smtpConfig);
Infrastructure.Database = new DatabaseService(config);
```

### Automatic Module Wrapping

Each instance automatically becomes a NestJS provider:

```typescript
@Module({
  providers: [Repository.Users],
})
export class AppModule {}
```

### Singleton Sharing

Instances are shared across your entire application. Declare once, use anywhere:

```typescript
// app.module.ts
@Module({
  providers: [Repository.Users],
})
export class AppModule {}

// user.module.ts
@Module({
  providers: [Repository.Users],  // Same instance
})
export class UserModule {}

// Both modules share the same UserRepository instance
```

---

## Dual Injection

### Natural Injection (Recommended)

Use without `@Inject()` for single instances per class:

```typescript
// instances.ts
export const Repository = createInstanceGroup('Repository');
Repository.Users = new UserRepository(database);

// service.ts
@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,  // No @Inject() needed
  ) {}
}
```

### Flexible Injection

Use with `@Inject()` for multiple instances of the same class:

```typescript
// instances.ts
export const Database = createInstanceGroup('Database');
Database.Primary = new DatabaseService(primaryConfig);
Database.Replica = new DatabaseService(replicaConfig);

// service.ts
@Injectable()
export class DataService {
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {}
}
```

---

## Configuration

### Options

```typescript
export const Repository = createInstanceGroup('Repository', {
  useClassAsToken: true,  // Enable dual injection (default: true)
  global: false,           // Make globally available (default: false)
  tokenPrefix: 'Repo',    // Token prefix (default: group name)
  scope: Scope.DEFAULT,    // Injection scope (default: Scope.DEFAULT)
});
```

### Global Providers

Make instances available without explicit imports:

```typescript
export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
  global: true,
});

GlobalInfrastructure.Logger = new LoggerService();

// Any module can inject
@Injectable()
export class SomeService {
  constructor(
    @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
  ) {}
}
```

### Scope Configuration

Control the lifecycle of your instances using NestJS scopes:

```typescript
import { Scope } from '@nestjs/common';

// Set scope per-instance
export const Repository = createInstanceGroup('Repository');
Repository.Users = new UserRepository(database);
Repository.Users.scope(Scope.REQUEST); // New instance per HTTP request

// Or set scope for all instances in group
export const Services = createInstanceGroup('Services', {
  scope: Scope.TRANSIENT, // New instance per injection
});

Services.Cache = new CacheService(config);
Services.Logger = new LoggerService();

// Available scopes:
// Scope.DEFAULT - Singleton (default)
// Scope.REQUEST - Per HTTP request
// Scope.TRANSIENT - Per injection
```

**When to use each scope:**

- **DEFAULT (Singleton)**: Database connections, external services, stateless services
- **REQUEST**: Request-specific data, user context, request-scoped logging
- **TRANSIENT**: Stateful services that need fresh instances

---

## Use Cases

### Shared Infrastructure

```typescript
export const Infrastructure = createInstanceGroup('Infrastructure');
Infrastructure.Database = new DatabaseService(config);
Infrastructure.Cache = new RedisService(redisConfig);
Infrastructure.Logger = new WinstonLogger();

@Module({
  providers: [
    Infrastructure.Database,
    Infrastructure.Cache,
  ],
})
export class AppModule {}
```

### External Services

```typescript
export const ExternalServices = createInstanceGroup('ExternalServices');
ExternalServices.AWS = new AwsClient(awsConfig);
ExternalServices.Stripe = new StripeClient(stripeKey);
ExternalServices.Slack = new SlackClient(slackToken);

@Injectable()
export class PaymentService {
  constructor(
    private aws: AwsClient,
    private stripe: StripeClient,
  ) {}
}
```

### Multiple Databases

```typescript
export const Database = createInstanceGroup('Database');
Database.Primary = new DatabaseService(primaryConfig);
Database.Replica = new DatabaseService(replicaConfig);

@Injectable()
export class DataService {
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {}
}
```

---

## API Reference

### createInstanceGroup(name, options?)

Creates a new instance group with dual injection support.

```typescript
const Repository = createInstanceGroup('Repository', {
  useClassAsToken: true,  // Enable dual injection
  global: false,
  tokenPrefix: 'Repo',
});
```

### getInjectionToken(groupName, key)

Gets the injection token for a specific instance.

### .scope(scope)

Sets the injection scope for a specific instance.

```typescript
import { Scope } from '@nestjs/common';

Repository.Users = new UserRepository(config);
Repository.Users.scope(Scope.REQUEST);
```

Available scopes:
- `Scope.DEFAULT` - Singleton (default)
- `Scope.REQUEST` - Per HTTP request
- `Scope.TRANSIENT` - Per injection

Gets the injection token for a specific instance.

```typescript
const token = getInjectionToken('Repository', 'Users');
// Returns 'Repository.Users'
```

### getInstanceToken(groupName, key)

Alias for `getInjectionToken()`.

### getInstanceClass(instance)

Gets the class constructor of an instance.

```typescript
const userRepo = new UserRepository();
const UserRepoClass = getInstanceClass(userRepo);
// UserRepoClass === UserRepository
```

### getAllInstances()

Gets all registered instances.

```typescript
const allInstances = getAllInstances();
allInstances.forEach((instance, token) => {
  console.log(`${token}:`, instance);
});
```

### instanceGroupToArray(groupName)

Converts a group to an array of providers.

```typescript
@Module({
  providers: [...instanceGroupToArray('Repository')],
})
export class AppModule {}
```

### allInstanceGroupsToArray()

Converts all groups to an array of providers.

```typescript
@Module({
  providers: [...allInstanceGroupsToArray()],
})
export class AppModule {}
```

### createModuleGroup(name)

Creates a module group for organizing NestJS modules.

```typescript
export const Repository = createModuleGroup('Repository');
Repository.Users = UsersModule;
```

---

## Best Practices

### When to Use Natural Injection

- Single instance per class
- Cleaner, more concise code
- No need for explicit tokens

```typescript
constructor(
  private userRepo: UserRepository,
) {}
```

### When to Use Flexible Injection

- Multiple instances of the same class
- Need explicit control over tokens
- Make dependencies more explicit

```typescript
constructor(
  @Inject('Database.Primary') private primaryDb: DatabaseService,
  @Inject('Database.Replica') private replicaDb: DatabaseService,
) {}
```

### Organization Tips

1. Group by layer: Repository, Service, Infrastructure
2. Group by feature: Users, Products, Orders
3. Use descriptive names: Database.Primary, Cache.Redis
4. Keep instances file central: `config/instances.ts`

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
