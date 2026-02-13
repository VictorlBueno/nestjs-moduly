# Examples

This directory contains practical examples of using NestJS Moduly.

## Examples

### Basic Usage

**File:** `basic-usage.ts`

Demonstrates:
- Creating instance groups
- Declaring instances
- Using as imports/providers
- Natural injection (without `@Inject()`)

```typescript
export const Repository = createInstanceGroup('Repository');
Repository.Users = new UserRepository(database);
```

### Dual Injection

**File:** `dual-injection.ts`

Demonstrates:
- Multiple instances of the same class
- Using `@Inject()` for explicit token control
- Best practices for multiple databases/instances

```typescript
export const Database = createInstanceGroup('Database');
Database.Primary = new DatabaseService(primaryConfig);
Database.Replica = new DatabaseService(replicaConfig);

constructor(
  @Inject('Database.Primary') private primaryDb: DatabaseService,
  @Inject('Database.Replica') private replicaDb: DatabaseService,
) {}
```

### Global Providers

**File:** `global-providers.ts`

Demonstrates:
- Creating global instance groups
- Making providers available to all modules
- No need to explicitly import global providers

```typescript
export const GlobalInfrastructure = createInstanceGroup('GlobalInfrastructure', {
  global: true,
});

GlobalInfrastructure.Logger = new LoggerService();
```

## Running Examples

These examples are meant for reference and are not meant to be run directly. They illustrate different patterns and use cases.

To test NestJS Moduly in a real project:

```bash
npm install nestjs-moduly
```

Then follow the patterns shown in these examples.
