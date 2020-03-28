import { ConnectionOptions } from 'typeorm'
import { Group } from './entities/group'
import { Message } from './entities/message'
import { User } from './entities/user'
import { Notification } from './entities/notification'

export const configuration = {
  options: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    port: 5432,
    database: 'studify',
    entities: [Group, Message, User, Notification],
    synchronize: true,
  } as ConnectionOptions,
  jwt: process.env.jwt as string,
  port: process.env.PORT as string,
}