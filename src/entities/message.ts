import { User } from "./user";
import { Group } from "./group";
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";

export interface IMessage {
  body: string;
  attachments?: string[];
  user: User;
  group: Group;
}

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  body!: string;

  @Column('varchar', { array: true, nullable: true })
  attachments?: string[];

  @ManyToOne(type => User, { eager: true })
  @JoinColumn()
  user!: User;

  @ManyToOne(type => Group)
  @JoinColumn()
  group!: Group;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  groupId?: string;

  constructor(data?: IMessage) {
    super()
    if (data) {
      this.body = data.body
      this.attachments = data.attachments
      this.user = data.user
      this.group = data.group
    }
  }

  static transform(data: Message) {
    return {
      id: data.id,
      body: data.body,
      attachments: data.attachments,
      user: data.user ? User.transformMinimal(data.user) : undefined,
      group: data.group ? Group.transformMinimal(data.group) : undefined,
      created: data.created,
      updated: data.updated,
    }
  }

  static transformSocket(data: Message) {
    return {
      id: data.id,
      groupId: data.group?.id ?? data.groupId,
      body: data.body,
      attachments: data.attachments,
      user: User.transformMinimal(data.user),
      created: data.created
    }
  }

  static transformMinimal(data: Message) {
    return {
      id: data.id,
      body: data.body,
      attachments: data.attachments,
    }
  }
}