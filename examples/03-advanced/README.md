# Exemplo Avançado - nestjs-moduly

Este exemplo demonstra todas as funcionalidades da biblioteca `nestjs-moduly`.

## Funcionalidades Demonstradas

### Instance Groups
- **createInstanceGroup()**: Criação de grupos de instâncias
- **Global Providers**: Infraestrutura global disponível em toda a aplicação
- **Scopes**: DEFAULT (singleton), REQUEST (por requisição), TRANSIENT (por injeção)

### Instanciação
- **Instanciação com Dependências**: Instanciar tudo no `instances.ts` com suas dependências
- **Multiple Instances**: Múltiplas instâncias do mesmo tipo (Primary/Replica DB, Redis/Memcached)
- **Scope Configuration**: Definição de escopo por grupo

### Helpers
- **getInjectionToken()**: Obtém token de injeção para uma instância específica
- **getAllInstances()**: Obtém todas as instâncias registradas
- **instanceGroupToArray()**: Converte um grupo para array de providers
- **allInstanceGroupsToArray()**: Converte todos os grupos para array

## Estrutura

```
src/
├── instances.ts                      # Declaração de instance groups e instanciação de tudo
├── services/
│   ├── logger.service.ts            # Serviço de logging
│   ├── database.service.ts          # Serviço de database
│   ├── cache.service.ts             # Serviço de cache
│   ├── request-context.service.ts   # Serviço de contexto de requisição
│   └── transient-counter.service.ts # Serviço contador transient
├── repositories/
│   ├── user.interface.ts            # Interface do repositório de usuários
│   ├── user.repository.ts           # Implementação do repositório
│   ├── product.interface.ts         # Interface do repositório de produtos
│   ├── product.repository.ts        # Implementação do repositório
│   ├── request-tracking.interface.ts # Interface do repositório de tracking
│   └── request-tracking.repository.ts # Implementação do repositório
├── app.module.ts                    # Módulo raiz com demonstração de helpers
├── main.ts                          # Bootstrap da aplicação
├── user/
│   ├── user.module.ts              # Módulo de usuários
│   └── user.controller.ts
├── product/
│   ├── product.module.ts           # Módulo de produtos
│   └── product.controller.ts
└── request/
    ├── request-tracking.module.ts  # Módulo de tracking
    └── request-tracking.controller.ts
```

## Como Executar

```bash
cd examples/03-advanced

npm install
npm run start:dev
```

## Testando os Endpoints

### Users Module
```bash
# Listar usuários (cache Redis)
curl http://localhost:3002/users

# Ver logs do Logger global
curl http://localhost:3002/users/logs

# Limpar logs
curl -X DELETE http://localhost:3002/users/logs
```

### Products Module
```bash
# Listar produtos (cache Memcached)
curl http://localhost:3002/products

# Limpar cache Memcached
curl -X DELETE http://localhost:3002/products/cache
```

### Request Tracking Module (Demonstrando Scopes)
```bash
# Obter ID da requisição atual (REQUEST scope - muda a cada request)
curl http://localhost:3002/tracking/request-id

# Incrementar contador (TRANSIENT scope - nova instância a cada injeção)
curl http://localhost:3002/tracking/increment
curl http://localhost:3002/tracking/increment
curl http://localhost:3002/tracking/increment

# Ver contador (será 1, pois é uma nova instância)
curl http://localhost:3002/tracking/count
```

## Explicação Detalhada

### 1. Arquivo instances.ts

```typescript
import { createInstanceGroup, getInjectionToken, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances } from 'nestjs-moduly';
import { Scope } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';
import { RequestContextService } from './services/request-context.service';
import { TransientCounterService } from './services/transient-counter.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';
import { RequestTrackingRepository } from './repositories/request-tracking.repository';

export { getInjectionToken, instanceGroupToArray, allInstanceGroupsToArray, getAllInstances };

export const Infrastructure = createInstanceGroup('Infrastructure', {
  global: true,
  useClassAsToken: true,
});

export const Database = createInstanceGroup('Database', {
  global: false,
  useClassAsToken: true,
});

export const Cache = createInstanceGroup('Cache', {
  global: false,
  useClassAsToken: true,
});

export const RequestScope = createInstanceGroup('RequestScope', {
  global: false,
  useClassAsToken: true,
  scope: Scope.REQUEST,
});

export const TransientScope = createInstanceGroup('TransientScope', {
  global: false,
  useClassAsToken: true,
  scope: Scope.TRANSIENT,
});

export const Repository = createInstanceGroup('Repository', {
  global: false,
  useClassAsToken: true,
});

Infrastructure.Logger = new LoggerService();

Database.Primary = new DatabaseService('PrimaryDB');
Database.Replica = new DatabaseService('ReplicaDB');

Cache.Redis = new CacheService('Redis');
Cache.Memcached = new CacheService('Memcached');

RequestScope.Context = new RequestContextService();

TransientScope.Counter = new TransientCounterService();

Repository.Users = new UserRepository(Infrastructure.Logger, Database.Primary, Cache.Redis);
Repository.Products = new ProductRepository(Database.Replica, Cache.Memcached);
Repository.RequestTracking = new RequestTrackingRepository(RequestScope.Context, TransientScope.Counter);
```

O arquivo `instances.ts` contém:
- Imports de createInstanceGroup e helpers
- Criação de instance groups com opções
- **Instanciação de tudo** com suas dependências normais
- Export de helpers para uso em outros arquivos

### 2. Global Providers

```typescript
Infrastructure.Logger = new LoggerService();
```

O Logger está configurado como global, pode ser injetado em qualquer módulo sem importação.

### 3. Multiple Instances

```typescript
Database.Primary = new DatabaseService('PrimaryDB');
Database.Replica = new DatabaseService('ReplicaDB');

Cache.Redis = new CacheService('Redis');
Cache.Memcached = new CacheService('Memcached');
```

Múltiplas instâncias do mesmo tipo, cada com configuração diferente.

### 4. Repositórios Instanciados com Dependências

```typescript
Repository.Users = new UserRepository(Infrastructure.Logger, Database.Primary, Cache.Redis);
Repository.Products = new ProductRepository(Database.Replica, Cache.Memcached);
Repository.RequestTracking = new RequestTrackingRepository(RequestScope.Context, TransientScope.Counter);
```

Os repositórios são instanciados no `instances.ts` com suas dependências normais.

### 5. Interfaces

```typescript
export interface IUserRepository {
  findAll(): any;
  findOne(id: string): any;
  getUserLogs(): string[];
  clearLogs(): string;
}
```

Define a interface que será injetada no Controller.

### 6. Módulos

```typescript
@Module({
  controllers: [UserController],
  providers: [
    Repository.Users,
  ],
})
export class UserModule {}
```

Adicione apenas o wrapper (`Repository.Users`) ao array de providers.

### 7. Controllers

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get()
  findAll() {
    return this.userRepository.findAll();
  }
}
```

Controller injeta a interface diretamente.

### 8. Helpers

**getInjectionToken():**
```typescript
const token = getInjectionToken('Database', 'Primary');
// Retorna 'Database.Primary'
```

**getAllInstances():**
```typescript
const allInstances = getAllInstances();
// Retorna Map<string, InstanceValue> com todas as instâncias
```

**instanceGroupToArray():**
```typescript
const dbProviders = instanceGroupToArray('Database');
// Retorna array com todos os providers do grupo Database
```

**allInstanceGroupsToArray():**
```typescript
const allProviders = allInstanceGroupsToArray();
// Retorna array com todos os providers de todos os grupos
```

### 9. Scopes

**DEFAULT (Singleton):**
- Mesma instância em toda a aplicação
- Use para: Database connections, services sem estado

**REQUEST:**
- Nova instância a cada requisição HTTP
- Use para: RequestContext, user session data

**TRANSIENT:**
- Nova instância a cada injeção
- Use para: Services que precisam de estado isolado

### 10. Demonstração de Scopes

RequestTrackingRepository demonstra a diferença entre REQUEST e TRANSIENT:

- **REQUEST Scope**: Mesmo requestId em múltiplas injeções no mesmo request
- **TRANSIENT Scope**: Nova instância a cada injeção, contador sempre começa em 1

Faça múltiplas chamadas a `/tracking/increment` e `/tracking/count` para ver a diferença!
