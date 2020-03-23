import { id, nested, ref } from "mongodb-typescript";
import { ObjectId } from "mongodb";
import { User } from "./user";
import { Message } from "./message";

export interface IGroup {
  name: string;
  description?: string;
  colorId: number;
  creator: User;
}

export class Group {
  @id id!: ObjectId;

  name!: string;
  description?: string;

  colorId!: number;

  @ref() creator!: User;

  constructor(data?: IGroup) {
    if(data) {
      this.name = data.name
      this.description = data.description
      this.colorId = data.colorId
      this.creator = data.creator
    }
  }
}