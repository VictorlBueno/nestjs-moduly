# Exemplos - nestjs-moduly

Esta pasta contém 3 exemplos completos de projetos NestJS usando a biblioteca `nestjs-moduly`, do básico ao avançado.

## Exemplos

### 01 - Básico
Demonstra o uso mais simples da biblioteca.

**Funcionalidades:**
- Criação de Instance Groups
- Instanciação com dependências no `instances.ts`
- Interfaces para injeção
- Injeção natural (sem `@Inject()`)
- Singleton pattern

```bash
cd 01-basic
npm install
npm run start:dev
```

**Porta:** 3000

---

### 02 - Intermediário
Explora mais funcionalidades da biblioteca.

**Funcionalidades:**
- Instanciação com dependências no `instances.ts`
- Múltiplas instâncias do mesmo tipo
- Organização por features
- Compartilhamento de singleton
- Configuração de scope

```bash
cd 02-intermediate
npm install
npm run start:dev
```

**Porta:** 3001

---

### 03 - Avançado
Demonstra todas as funcionalidades da biblioteca.

**Funcionalidades:**
- **Instance Groups Avançados**: Global providers, scopes (DEFAULT, REQUEST, TRANSIENT)
- **Helpers**: `getInjectionToken()`, `getAllInstances()`, `instanceGroupToArray()`, `allInstanceGroupsToArray()`
- **Múltiplas Instâncias**: Database Primary/Replica, Cache Redis/Memcached
- **Scopes**: Singleton, Request-scoped, Transient

```bash
cd 03-advanced
npm install
npm run start:dev
```

**Porta:** 3002

## Progressão dos Exemplos

| Funcionalidade | 01 - Básico | 02 - Intermediário | 03 - Avançado |
|---------------|-------------|-------------------|---------------|
| createInstanceGroup | ✓ | ✓ | ✓ |
| Instanciação com dependências | ✓ | ✓ | ✓ |
| Múltiplas Instâncias | - | ✓ | ✓ |
| Interfaces para injeção | ✓ | ✓ | ✓ |
| Global Providers | - | - | ✓ |
| Scopes (DEFAULT) | - | ✓ | ✓ |
| Scopes (REQUEST) | - | - | ✓ |
| Scopes (TRANSIENT) | - | - | ✓ |
| Helpers | - | - | ✓ |

## Como Executar Todos os Exemplos

Cada exemplo é um projeto NestJS independente com suas próprias dependências.

```bash
# Para cada exemplo:
cd examples/0X-<nome>
npm install
npm run start:dev
```

## Arquitetura

Todos os exemplos seguem o padrão de organização:

```
0X-<nome>/
├── src/
│   ├── instances.ts          # Declaração de instance groups e instanciação de tudo
│   ├── services/              # Serviços de infraestrutura (Database, Cache, Logger)
│   ├── repositories/         # Repositórios (com interfaces)
│   ├── [features]/           # Módulos de feature (com Controller)
│   ├── app.module.ts         # Módulo raiz
│   └── main.ts               # Bootstrap
├── package.json
├── tsconfig.json
└── README.md                # Explicação específica do exemplo
```

## Padrão de Uso da Lib

O padrão correto de uso da lib é:

### 1. Criar Instance Groups

```typescript
// instances.ts
export const Database = createInstanceGroup('Database');
export const Repository = createInstanceGroup('Repository');
```

### 2. Instanciar Tudo no instances.ts

```typescript
// instances.ts
const database = new Database({host: 'localhost', port: 5432});
Repository.Users = new UserRepository(database);
```

As dependências são injetadas normalmente (não usa `useValue`).

### 3. Definir Interface

```typescript
export interface IUserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
}
```

### 4. Adicionar ao Providers do Módulo

```typescript
@Module({
  controllers: [UserController],
  providers: [
    Repository.Users,
  ],
})
```

Adicione apenas o wrapper ao array de providers.

### 5. Controller Injeta a Interface

```typescript
@Controller()
export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get('users')
  findAll() {
    return this.userRepository.findAll();
  }
}
```

Controller injeta a interface diretamente.

## Benefícios do Padrão

1. **Centralização**: Todas as instâncias são criadas em um lugar
2. **Simplicidade**: Controller injeta a interface diretamente
3. **Flexibilidade**: Fácil mudar dependências no `instances.ts`
4. **Singleton**: Mesma instância compartilhada em toda a aplicação
5. **Type Safety**: Interfaces garantem tipagem forte

## Dependências Locais

Todos os exemplos usam a biblioteca local:
```json
"dependencies": {
  "nestjs-moduly": "file:../.."
}
```

Isso permite testar mudanças na biblioteca sem publicar no npm.

## Testes Recomendados

### Exemplo Básico
1. Listar todos os usuários
2. Criar novo usuário
3. Buscar usuário por ID

### Exemplo Intermediário
1. Listar produtos (vem do cache)
2. Limpar cache
3. Listar produtos novamente (vem do banco)
4. Criar pedido (usa primary DB)
5. Listar pedidos (usa replica DB)

### Exemplo Avançado
1. Testar injeção de dependências
2. Ver logs do Logger global
3. Testar REQUEST scope (request ID muda a cada request)
4. Testar TRANSIENT scope (nova instância a cada injeção)
5. Usar helpers para listar todas as instâncias registradas

## Dicas

- **Portas**: Cada exemplo usa uma porta diferente (3000, 3001, 3002) para rodar simultaneamente
- **Logs**: O exemplo avançado mostra logs detalhados de todas as instâncias registradas
- **Scopes**: Use o exemplo avançado para entender a diferença entre DEFAULT, REQUEST e TRANSIENT scopes
- **Pattern**: Siga o padrão de instanciar tudo no `instances.ts` com dependências normais
