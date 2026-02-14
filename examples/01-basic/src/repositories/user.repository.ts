import {IUserRepository} from "./user.interface";
import { Database } from "../services/database";

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserRepository implements IUserRepository {
  private users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  constructor(private database: Database) {}

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(user: Omit<User, 'id'>): User {
    const newUser = { ...user, id: Math.random().toString(36).substring(7) };
    this.users.push(newUser);
    return newUser;
  }
}
