import { id, ref } from "mongodb-typescript";
import { ObjectId } from "mongodb";
import { User } from "./user";
import { Group } from "./group";

export interface IMessage {
  body: string;
  attachments: string[];
  author: User;
  group: Group;
}

export class Message {
  @id id!: ObjectId;
  
  body!: string;
  attachments!: string[];

  @ref() author!: User;
  @ref() group!: Group;

  constructor(data?: IMessage) {
    if(data) {
      this.body = data.body
      this.attachments = data.attachments
      this.author = data.author
      this.group = data.group
    }
  }
}