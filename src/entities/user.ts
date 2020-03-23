import { Group } from './group';
import { Exclude, Type, Transform } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, BaseEntity } from 'typeorm';

export interface IUser {
  username: string;
  email: string;
  name: string;

  hash: string;

  groups: Group[];
  createdGroups: Group[];

  permissionLevel: number;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  name!: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  hash!: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  permissionLevel!: number;

  @ManyToMany(type => Group, group => group.users, { cascade: true })
  @JoinTable()
  groups!: Group[];

  @OneToMany(type => Group, group => group.creator, { cascade: true })
  createdGroups!: Group[];

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  constructor(data?: IUser) {
    super()
    if (data) {
      this.username = data.username
      this.email = data.email
      this.name = data.name
      this.hash = data.hash
      this.groups = data.groups
      this.createdGroups = data.createdGroups
      this.permissionLevel = data.permissionLevel
    }
  }

  hasGroup(group: Group): boolean {
    for(let subscribedGroup of this.groups) {
      if(group.id === subscribedGroup.id) {
        return true
      }
    }

    return false
  }

  static transform(data: User) {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
      created: data.created,
      updated: data.updated,
    }
  }

  static transformOwner(data: User) {
    console.log(data)
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
      groups: data.groups ? data.groups.map(group => Group.transform(group)) : undefined,
      createdGroups: data.createdGroups ? data.createdGroups.map(group => Group.transform(group)) : undefined,
      created: data.created,
      updated: data.updated,
    }
  }

  static transformMinimal(data: User) {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name,
    }
  }
}