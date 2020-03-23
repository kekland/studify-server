import { User } from "./user";
import { Entity, PrimaryColumn, Column, ManyToMany, ManyToOne, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

export interface IGroup {
  name: string;
  description?: string;
  colorId: number;
  creator: User;
}

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  description?: string;

  @Column()
  colorId!: number;

  @ManyToMany(type => User, user => user.groups)
  users!: User[];

  @ManyToOne(type => User, user => user.createdGroups, { eager: true })
  creator!: User;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  constructor(data?: IGroup) {
    super()
    if (data) {
      this.name = data.name
      this.description = data.description
      this.colorId = data.colorId
      this.creator = data.creator
    }
  }

  static transform(data: Group) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      colorId: data.colorId,
      users: data.users ? data.users.map(User.transformMinimal) : undefined,
      creator: User.transformMinimal(data.creator),
      created: data.created,
      updated: data.updated,
    }
  }

  static transformMinimal(data: Group) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      colorId: data.colorId,
    }
  }
}