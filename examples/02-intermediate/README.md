# Exemplo Intermediário - nestjs-moduly

Este exemplo demonstra funcionalidades intermediárias da biblioteca `nestjs-moduly`.

## Funcionalidades Demonstradas

- **Criação de Instance Groups**: `createInstanceGroup()`
- **Instanciação com Dependências**: Instanciar tudo no `instances.ts` com suas dependências
- **Múltiplas Instâncias do Mesmo Tipo**: Primary e Replica do Database
- **Organização por Features**: Módulos separados (ProductModule, OrderModule)
- **Compartilhamento de Singleton**: Mesma instância em múltiplos módulos
- **Configuração de Scope**: Definindo escopo padrão para instâncias

## Estrutura

```
src/
├── instances.ts                  # Declaração de instance groups e instanciação de tudo
├── services/
│   ├── database.service.ts      # Serviço de database
│   └── cache.service.ts         # Serviço de cache
├── repositories/
│   ├── product.interface.ts     # Interface do repositório de produtos
│   ├── product.repository.ts    # Implementação do repositório
│   ├── order.interface.ts       # Interface do repositório de pedidos
│   └── order.repository.ts      # Implementação do repositório
├── app.module.ts                # Módulo raiz
├── main.ts                      # Bootstrap da aplicação
├── product/
│   ├── product.module.ts        # Módulo de produtos
│   └── product.controller.ts
└── order/
    ├── order.module.ts          # Módulo de pedidos
    └── order.controller.ts
```

## Como Executar

```bash
cd examples/02-intermediate

npm install
npm run start:dev
```

## Testando os Endpoints

```bash
# Listar produtos (vem do cache)
curl http://localhost:3001/products

# Limpar cache
curl -X DELETE http://localhost:3001/products/cache

# Listar produtos novamente (agora vem do banco)
curl http://localhost:3001/products

# Ver status dos serviços
curl http://localhost:3001/products/status

# Listar todos os pedidos (usa replica DB)
curl http://localhost:3001/orders

# Criar pedido (usa primary DB para write, replica para read)
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

## Explicação

### 1. Arquivo instances.ts

```typescript
import { createInstanceGroup } from 'nestjs-moduly';
import { ProductRepository } from './repositories/product.repository';
import { OrderRepository } from './repositories/order.repository';
import { DatabaseService } from './services/database.service';
import { CacheService } from './services/cache.service';

export const Database = createInstanceGroup('Database');
export const Cache = createInstanceGroup('Cache');
export const Repository = createInstanceGroup('Repository');

Database.Primary = new DatabaseService({ name: 'PrimaryDB', type: 'PostgreSQL' });
Database.Replica = new DatabaseService({ name: 'ReplicaDB', type: 'PostgreSQL Replica' });
Cache.Redis = new CacheService({ host: 'localhost', port: 6379 });

Repository.Products = new ProductRepository(Database.Primary, Cache.Redis);
Repository.Orders = new OrderRepository(Database.Primary, Database.Replica);
```

O arquivo `instances.ts` contém:
- Criação de instance groups
- Instanciação de tudo com suas dependências normais

### 2. Interfaces

```typescript
export interface IProductRepository {
  findAll(): any;
  clearCache(): string;
  getDatabaseStatus(): string;
  getCacheStatus(): string;
}
```

Define a interface que será injetada no Controller.

### 3. Repositórios

```typescript
export class ProductRepository implements IProductRepository {
  constructor(
    private primaryDb: any,
    private cache: any,
  ) {}
}
```

O repositório define suas dependências no construtor, mas a instanciação acontece no `instances.ts`.

### 4. Módulos

```typescript
@Module({
  controllers: [ProductController],
  providers: [
    Repository.Products,
  ],
})
export class ProductModule {}
```

Adicione apenas o wrapper (`Repository.Products`) ao array de providers.

### 5. Controllers

```typescript
@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: IProductRepository) {}

  @Get()
  findAll() {
    return this.productRepository.findAll();
  }
}
```

Controller injeta a interface diretamente.

### 6. Compartilhamento de Singleton

A mesma instância `Database.Primary` é usada tanto no ProductModule quanto no OrderModule. Elas compartilham o mesmo estado.
