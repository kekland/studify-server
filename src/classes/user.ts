import { id, ref, nested } from 'mongodb-typescript'
import { ObjectId } from 'mongodb'
import { Group } from './group';

export interface IUser {
  username: string;
  email: string;
  name: string;

  hash: string;

  groups: Group[];
  friends: User[];

  permissionLevel: number;
}

export class User {
  @id id!: ObjectId;

  username!: string;
  email!: string;
  name!: string;

  hash!: string;

  permissionLevel!: number;

  @ref() @nested(() => Group) groups!: Group[];
  @ref() @nested(() => User) friends!: User[];

  constructor(data?: IUser) {
    if (data) {
      this.username = data.username
      this.email = data.email
      this.name = data.name
      this.hash = data.hash
      this.groups = data.groups
      this.friends = data.friends
      this.permissionLevel = data.permissionLevel
    }
  }
}