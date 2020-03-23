import { Repository } from "mongodb-typescript";
import { User } from "../classes/user";
import { Message } from "../classes/message";
import { Group } from "../classes/group";
import { MongoClient } from "mongodb";

export class RepositoryManager {
  static userRepository: Repository<User>
  static messageRepository: Repository<Message>
  static groupRepository: Repository<Group>

  static initialize(client: MongoClient) {
    RepositoryManager.userRepository = new Repository<User>(User, client, 'users')
    RepositoryManager.messageRepository = new Repository<Message>(Message, client, 'messages')
    RepositoryManager.groupRepository = new Repository<Group>(Group, client, 'groups')
  }
}