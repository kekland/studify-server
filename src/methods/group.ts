import { IsNotEmpty } from "class-validator";
import { UnauthorizedMethod } from "./utils";
import { Group } from "../entities/group";

export class GroupGetData {
  @IsNotEmpty()
  id!: string;
}

export const getGroup: UnauthorizedMethod<GroupGetData, Group | undefined> = async (data) => {
  const group = await Group.findOne(data.id)
  return group
}