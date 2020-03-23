import { AuthorizedMethod, UnauthorizedMethod } from "./utils";
import { Group } from "../entities/group";
import { Errors } from "../validation/errors";
import { MinLength, IsNotEmpty, IsNumber } from "class-validator";
import { getGroup } from "./group";

export class GroupCreateData {
  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;
}

export class GroupUpdateData {
  @IsNotEmpty()
  id!: string;

  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNumber()
  colorId!: number;
}


export const createGroup: AuthorizedMethod<GroupCreateData, Group> = async (user, data) => {
  const group = new Group({
    name: data.name,
    description: data.description,
    colorId: data.colorId,
    creator: user
  })
  
  await group.save()

  user.groups.push(group)
  user.createdGroups.push(group)
  await user.save()

  console.log(group)
  return group
}

export const updateGroup: AuthorizedMethod<GroupUpdateData, Group> = async (user, data) => {
  const group = await getGroup({ id: data.id })

  if (!group) throw Errors.invalidRequest

  group.name = data.name
  group.description = data.description
  group.colorId = data.colorId

  await group.save()
  return group
}