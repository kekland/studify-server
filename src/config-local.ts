import { ConnectionOptions } from 'typeorm'
import { Group } from './entities/group'
import { Message } from './entities/message'
import { User } from './entities/user'
import { Notification } from './entities/notification'

export const configuration = {
  options: {
    type: 'postgres',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'studify',
    entities: [Group, Message, User, Notification],
    synchronize: true,
  } as ConnectionOptions,
  jwt: 'kekland',
  port: '8080',
}