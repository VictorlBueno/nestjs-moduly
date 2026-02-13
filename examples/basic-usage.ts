import { Module, Injectable, Inject } from '@nestjs/common';
import { createInstanceGroup } from 'nestjs-moduly';

@Injectable()
class UserRepository {
  constructor(private config: any) {
    console.log('UserRepository created');
  }

  findUser(id: string) {
    return { id, name: 'John Doe' };
  }
}

@Injectable()
class AddressRepository {
  constructor(private config: any) {
    console.log('AddressRepository created');
  }

  findAddress(userId: string) {
    return { userId, city: 'New York' };
  }
}

@Injectable()
class AwsKeyManager {
  constructor(private config: any) {
    console.log('AwsKeyManager created');
  }

  generateKey() {
    return 'aws-key-123';
  }
}

export const Repository = createInstanceGroup('Repository');
export const Service = createInstanceGroup('Service');

Repository.Users = new UserRepository({ host: 'localhost', port: 5432 });
Repository.Address = new AddressRepository({ host: 'localhost', port: 5432 });
Service.KeyManager = new AwsKeyManager({ token: 'token', secret: 'secret' });

@Module({
  imports: [
    Repository.Users,
    Repository.Address,
    Service.KeyManager,
  ],
})
export class AppModule {
  constructor(
    private userRepo: UserRepository,
    private addressRepo: AddressRepository,
    private keyManager: AwsKeyManager,
  ) {
    console.log('AppModule initialized');
  }
}
