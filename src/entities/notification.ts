import { User } from "./user";
import { Group } from "./group";
import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";

export type NotificationType = 'onMessage'

export interface INotificationBody {
  type: NotificationType;
  message: string;
  groupId?: string;
}

export interface INotification {
  userId: string;
  type: NotificationType;
  message: string;
  groupId?: string;
}

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  groupId?: string;

  @Column()
  type!: NotificationType;

  @Column()
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  created!: Date;

  constructor(data?: INotification) {
    super()
    if (data) {
      this.userId = data.userId
      this.groupId = data.groupId
      this.type = data.type
      this.message = data.message
      this.read = false
    }
  }

  static transform(data: Notification) {
    return {
      id: data.id,
      userId: data.userId,
      groupId: data.groupId,
      type: data.type,
      message: data.message,
      created: data.created,
    }
  }

  static transformMinimal(data: Notification) {
    return {
      id: data.id,
      groupId: data.groupId,
      type: data.type,
      message: data.message,
      created: data.created,
    }
  }
}