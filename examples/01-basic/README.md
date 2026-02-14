# Exemplo Básico - nestjs-moduly

Este exemplo demonstra o uso mais simples da biblioteca `nestjs-moduly`.

## Funcionalidades Demonstradas

- **Criação de Instance Groups**: `createInstanceGroup()`
- **Instanciação com Dependências**: Instanciar tudo no `instances.ts` com suas dependências
- **Interfaces**: Definição de interfaces para injeção
- **Injeção Natural**: Injetando dependências sem usar `@Inject()`
- **Singleton Pattern**: A mesma instância compartilhada em toda a aplicação

## Estrutura

```
src/
├── instances.ts              # Declaração de instance groups e instanciação de tudo
├── services/
│   └── database.ts          # Serviço de database
├── repositories/
│   ├── user.interface.ts    # Interface do repositório
│   └── user.repository.ts   # Implementação do repositório
├── app.controller.ts        # Controlador REST
├── app.module.ts            # Módulo principal
└── main.ts                  # Bootstrap da aplicação
```

## Como Executar

```bash
cd examples/01-basic

npm install
npm run start:dev
```

## Testando os Endpoints

```bash
# Listar todos os usuários
curl http://localhost:3000/users

# Buscar usuário por ID
curl http://localhost:3000/users/1

# Criar novo usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

## Explicação

### 1. Arquivo instances.ts

```typescript
import { createInstanceGroup } from 'nestjs-moduly';
import { UserRepository } from './repositories/user.repository';
import { Database } from './services/database';

export const Repository = createInstanceGroup('Repository');

const database = new Database({ host: 'localhost', port: 5432 });
Repository.Users = new UserRepository(database);
```

O arquivo `instances.ts` contém:
- Criação de instance groups
- Instanciação de todas as dependências com suas dependências normais

### 2. Interfaces

```typescript
export interface IUserRepository {
  findAll(): User[];
  findById(id: string): User | undefined;
  create(user: Omit<User, 'id'>): User;
}
```

Define a interface que será injetada no Controller.

### 3. Módulo

```typescript
@Module({
  controllers: [AppController],
  providers: [
    Repository.Users,
  ],
})
```

Adicione apenas o wrapper (`Repository.Users`) ao array de providers.

### 4. Controller

```typescript
@Controller()
export class AppController {
  constructor(private readonly userRepository: IUserRepository) {}

  @Get('users')
  getAllUsers() {
    return this.userRepository.findAll();
  }
}
```

Controller injeta a interface diretamente.
