import { PaginatedData } from "../messaging/_data";
import { IsArray, IsString } from "class-validator";

export class SetNotificationsAsReadData {
  @IsArray()
  @IsString({each: true})
  notifications!: string[]
}

export class SetGroupAsReadData {
  @IsString()
  groupId!: string;
}