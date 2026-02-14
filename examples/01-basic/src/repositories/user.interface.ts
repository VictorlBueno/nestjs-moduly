import {User} from "./user.repository";

export interface IUserRepository {
    findAll(): User[]
    findById(id: string): User | undefined
    create(user: Omit<User, 'id'>): User
}