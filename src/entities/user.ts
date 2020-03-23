import { Group } from './group';
import { Exclude, Type, Transform } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, BaseEntity } from 'typeorm';

export interface IUser {
  username: string;
  email: string;
  name: string;

  hash: string;

  groups: Group[];

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
      this.permissionLevel = data.permissionLevel
    }
  }

  toSimplified() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      name: this.name,
      created: this.created,
    }
  }
}