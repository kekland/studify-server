import { User } from "./user";
import { Entity, PrimaryColumn, Column, ManyToMany, ManyToOne, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

export interface IGroup {
  name: string;
  description?: string;
  colorId: number;
  icon: string;
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
  
  @Column()
  icon!: string;

  @Column()
  userCount!: number; 

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
      this.icon = data.icon
      this.creator = data.creator
      this.userCount = 1;
    }
  }

  static transform(data: Group) {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      colorId: data.colorId,
      icon: data.icon,
      userCount: data.userCount,
      creator: User.transformMinimal(data.creator),
      created: data.created,
      updated: data.updated,
    }
  }

  static transformMinimal(data: Group) {
    return {
      id: data.id,
      name: data.name,
      userCount: data.userCount,
      description: data.description,
      colorId: data.colorId,
      icon: data.icon,
    }
  }
}