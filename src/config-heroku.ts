import { ConnectionOptions } from 'typeorm'
import { Group } from './entities/group'
import { Message } from './entities/message'
import { User } from './entities/user'

export const configuration = {
  options: {
    url: process.env.DATABASE_URL,
    type: 'postgres',
    port: 5432,
    database: 'studify',
    entities: [Group, Message, User],
    synchronize: true,
  } as ConnectionOptions,
  jwt: process.env.jwt,
  port: 8080,
  socketPort: 5005,
}