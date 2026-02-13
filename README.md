# NestJS Moduly

[![NPM Version](https://img.shields.io/npm/v/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![License](https://img.shields.io/npm/l/nestjs-moduly.svg)](https://github.com/VictorlBueno/nestjs-moduly/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/nestjs-moduly.svg)](https://www.npmjs.com/package/nestjs-moduly)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Compatible-red.svg)](https://nestjs.com/)

A TypeScript library for simplifying NestJS module management and dependency injection. Organize your modules into logical groups, share singleton instances across your entire application, and enjoy dual injection support with a clean, declarative syntax.

## Installation

Install the package using your favorite package manager:

```bash
npm install nestjs-moduly
```

```bash
yarn add nestjs-moduly
```

```bash
pnpm add nestjs-moduly
```

## Features

- **Organized Module Groups** - Group modules by feature or layer (Repository, Service, Infrastructure, etc.)
- **Singleton Instance Sharing** - Declare instances once and share them across multiple modules
- **Automatic Module Wrapping** - Instances automatically become NestJS modules with full DI support
- **Dual Injection Support** - Inject with or without `@Inject()` decorator for maximum flexibility
- **Zero Configuration** - Works out of the box with NestJS standard decorators
- **Type-Safe** - Full TypeScript support with type inference
- **Global Providers** - Optional global availability for shared infrastructure

## Quick Start

### Singleton Shared Instances

Declare instances once and share them across modules with dual injection support:

```typescript
// instances.ts
import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from './user.repository';
import { AddressRepository } from './address.repository';

export const Repository = createInstanceGroup('Repository');
export const Service = createInstanceGroup('Service');

// Instances become modules automatically
Repository.Users = new UserRepository(database);
Repository.Address = new AddressRepository(database);
Service.KeyManager = new AwsKeyManager(awsConfig);
```

Use in any module:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { Repository, Service } from './instances';

@Module({
  imports: [
    Repository.Users,
    Repository.Address,
    Service.KeyManager,
  ],
})
export class AppModule {
  constructor(
    // Natural injection - no @Inject() needed
    private userRepo: UserRepository,
    private addressRepo: AddressRepository,

    // Flexible injection - use @Inject() when needed
    private keyManager: AwsKeyManager,
  ) {}
}
```

Reuse the same instances in different modules:

```typescript
// car.module.ts
import { Module } from '@nestjs/common';
import { Repository } from './instances';

@Module({
  imports: [
    Repository.Users,
    Repository.Address,
  ],
})
export class CarModule {
  constructor(
    private userRepo: UserRepository,
  ) {}
}
```

## Documentation

### Instance Groups

Instance groups allow you to declare instances once and share them across your entire application. Each instance automatically becomes a NestJS module that can be used in both `imports` and `providers` arrays.

#### Creating Instance Groups

```typescript
import { createInstanceGroup } from 'nestjs-moduly';

// Create instance groups for different categories
export const Repository = createInstanceGroup('Repository');
export const Service = createInstanceGroup('Service');
export const Infrastructure = createInstanceGroup('Infrastructure');
```

#### Declaring Instances

```typescript
// Declare instances with their dependencies
const databaseConfig = { host: 'localhost', port: 5432 };
const awsConfig = { token: 'token', secret: 'secret' };

// Instances become modules automatically
Repository.Users = new UserRepository(databaseConfig);
Repository.Address = new AddressRepository(databaseConfig);
Service.KeyManager = new AwsKeyManager(awsConfig);
Service.StoreManager = new S3Bucket(awsConfig);
```

#### Using in Modules

```typescript
@Module({
  imports: [
    Repository.Users,
    Repository.Address,
    Service.StoreManager,
  ],
})
export class AppModule {}
```

### Dual Injection Support

NestJS Moduly supports both injection styles for maximum flexibility.

#### Without @Inject() (Natural Injection)

Best for single instances per class - cleaner syntax, no decorator needed:

```typescript
// instances.ts
export const Repository = createInstanceGroup('Repository');
Repository.Users = new UserRepository(database);

// service.ts
@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
  ) {}

  async getUser(id: string) {
    return this.userRepo.findUser(id);
  }
}
```

#### With @Inject() (Flexible Injection)

Best for multiple instances of the same class or when you need explicit control:

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

  async getData(query: string) {
    const primaryResult = this.primaryDb.query(query);
    const replicaResult = this.replicaDb.query(query);
    return { primary: primaryResult, replica: replicaResult };
  }
}
```

#### Configuring Dual Injection

You can control dual injection behavior:

```typescript
const Repository = createInstanceGroup('Repository', {
  useClassAsToken: true,  // Enable dual injection (default)
  global: false,
});

// Disable class token registration (only string token available)
const StrictService = createInstanceGroup('StrictService', {
  useClassAsToken: false,
  global: false,
});
```

### Advanced Features

#### Global Instance Groups

Make instances available to all modules without explicit imports:

```typescript
export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
  tokenPrefix: 'Global',
  global: true,
});

GlobalInfrastructure.Logger = new LoggerService();

// Any module can inject without importing
@Injectable()
export class SomeService {
  constructor(
    @Inject('GlobalInfrastructure.Logger') private logger: LoggerService,
  ) {}
}
```

#### Helper Functions

```typescript
import {
  getInjectionToken,
  getInstanceToken,
  getInstanceClass,
  instanceGroupToArray,
  allInstanceGroupsToArray,
} from 'nestjs-moduly';

// Get injection token dynamically
const token = getInjectionToken('Repository', 'Users');
// Returns 'Repository.Users'

// Alias for getInjectionToken
const token2 = getInstanceToken('Repository', 'Users');

// Get instance class
const userRepo = new UserRepository();
const UserRepoClass = getInstanceClass(userRepo);
// UserRepoClass === UserRepository

// Convert group to array of modules
const modules = instanceGroupToArray('Repository');

// Get all modules from all groups
const allModules = allInstanceGroupsToArray();
```

### Module Groups

Organize NestJS modules into logical groups for cleaner imports:

```typescript
// modules.ts
import { createModuleGroup } from 'nestjs-moduly';
import { UsersModule } from './users/users.module';
import { AddressModule } from './address/address.module';
import { StoreModule } from './store/store.module';

export const Repository = createModuleGroup('Repository');
export const Service = createModuleGroup('Service');

Repository.Users = UsersModule;
Repository.Address = AddressModule;
Service.Store = StoreModule;
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { Repository, Service } from './modules';

@Module({
  imports: [
    Repository.Users,
    Repository.Address,
    Service.Store,
  ],
})
export class AppModule {}
```

## Usage Examples

### Shared Infrastructure Services

```typescript
// instances.ts
export const Infrastructure = createInstanceGroup('Infrastructure');

Infrastructure.Database = new DatabaseService(config);
Infrastructure.Cache = new RedisService(redisConfig);
Infrastructure.Logger = new WinstonLogger();
```

### External Service Clients

```typescript
// instances.ts
export const ExternalServices = createInstanceGroup('ExternalServices');

ExternalServices.AWS = new AwsClient(awsConfig);
ExternalServices.Stripe = new StripeClient(stripeKey);
ExternalServices.Slack = new SlackClient(slackToken);
```

### Multiple Database Instances

```typescript
// instances.ts
export const Database = createInstanceGroup('Database');

Database.Primary = new DatabaseService(primaryConfig);
Database.Replica = new DatabaseService(replicaConfig);

// module.ts
@Injectable()
export class DataService {
  constructor(
    @Inject('Database.Primary') private primaryDb: DatabaseService,
    @Inject('Database.Replica') private replicaDb: DatabaseService,
  ) {}
}
```

## API Reference

### createInstanceGroup(name, options?)

Creates a new instance group that automatically wraps instances as NestJS modules with dual injection support.

**Parameters:**

- `name` (string): The name of the instance group
- `options` (InstanceGroupOptions, optional): Configuration options
  - `tokenPrefix` (string): Prefix for injection tokens (default: group name)
  - `global` (boolean): Make instances globally available (default: false)
  - `useClassAsToken` (boolean): Enable dual injection (default: true)

**Returns:** InstanceGroup proxy object

**Example:**

```typescript
export const Repository = createInstanceGroup('Repository', {
  tokenPrefix: 'Repo',
  global: false,
  useClassAsToken: true,
});
```

### getInjectionToken(groupName, key)

Gets the injection token for a specific instance.

**Parameters:**

- `groupName` (string): The name of the instance group
- `key` (string): The key within the group

**Returns:** string (injection token)

**Example:**

```typescript
const token = getInjectionToken('Repository', 'Users');
// Returns 'Repository.Users'
```

### getInstanceToken(groupName, key)

Alias for `getInjectionToken()`.

**Parameters:**

- `groupName` (string): The name of the instance group
- `key` (string): The key within the group

**Returns:** string (injection token)

### getInstanceClass(instance)

Gets the class constructor of an instance.

**Parameters:**

- `instance` (InstanceValue): The instance to get the class from

**Returns:** The class constructor

**Example:**

```typescript
const userRepo = new UserRepository();
const UserRepoClass = getInstanceClass(userRepo);
// UserRepoClass === UserRepository
```

### getAllInstances()

Gets all registered instances from all groups.

**Returns:** Map<string, InstanceValue>

**Example:**

```typescript
const allInstances = getAllInstances();
allInstances.forEach((instance, token) => {
  console.log(`${token}:`, instance);
});
```

### instanceGroupToArray(groupName)

Converts an instance group to an array of modules.

**Parameters:**

- `groupName` (string): The name of the instance group

**Returns:** ClassType[]

**Example:**

```typescript
@Module({
  imports: [...instanceGroupToArray('Repository')],
})
export class AppModule {}
```

### allInstanceGroupsToArray()

Converts all instance groups to an array of modules.

**Returns:** ClassType[]

**Example:**

```typescript
@Module({
  imports: [...allInstanceGroupsToArray()],
})
export class AppModule {}
```

### createModuleGroup(name)

Creates a module group for organizing NestJS modules.

**Parameters:**

- `name` (string): The name of the module group

**Returns:** ModuleGroup object

**Example:**

```typescript
export const Repository = createModuleGroup('Repository');
Repository.Users = UsersModule;
```

## Best Practices

### When to Use Natural Injection (Without @Inject())

Use natural injection when:
- You have a single instance per class
- You want cleaner, more concise code
- You don't need explicit control over injection tokens

```typescript
constructor(
  private userRepo: UserRepository,
) {}
```

### When to Use Flexible Injection (With @Inject())

Use flexible injection when:
- You have multiple instances of the same class
- You need explicit control over injection tokens
- You want to make dependencies more explicit

```typescript
constructor(
  @Inject('Database.Primary') private primaryDb: DatabaseService,
  @Inject('Database.Replica') private replicaDb: DatabaseService,
) {}
```

### Organization Tips

1. **Group by layer:** Repository, Service, Infrastructure
2. **Group by feature:** Users, Products, Orders
3. **Use descriptive names:** Database.Primary, Cache.Redis
4. **Keep instances file central:** `config/instances.ts`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Victor Bueno](https://github.com/VictorlBueno)

---

Built with [NestJS](https://nestjs.com/)
