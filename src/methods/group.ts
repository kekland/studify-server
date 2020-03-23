import { IsNotEmpty } from "class-validator";
import { UnauthorizedMethod } from "./utils";
import { Group } from "../classes/group";
import { RepositoryManager } from "../database/database";
import { ObjectId } from "mongodb";

export class GroupGetData {
  @IsNotEmpty()
  id!: string;
}

export const getGroup: UnauthorizedMethod<GroupGetData, Group | null> = async (data) => {
  const group = await RepositoryManager.groupRepository.findById(new ObjectId(data.id))
  return group
}