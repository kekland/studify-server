import { Repository } from "mongodb-typescript";
import { User } from "../classes/user";
import { Message } from "../classes/message";
import { Group } from "../classes/group";
import { MongoClient } from "mongodb";

export class RepositoryManager {
  userRepository: Repository<User>
  messageRepository: Repository<Message>
  groupRepository: Repository<Group>

  constructor(client: MongoClient) {
    this.userRepository = new Repository<User>(User, client, 'users')
    this.messageRepository = new Repository<Message>(Message, client, 'messages')
    this.groupRepository = new Repository<Group>(Group, client, 'groups')
  }
}