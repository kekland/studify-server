import { AuthorizedMethod, UnauthorizedMethod } from "./utils";
import { Group } from "../classes/group";
import { RepositoryManager } from "../database/database";
import { ObjectId } from "mongodb";
import { Errors } from "../validation/errors";
import { Repository } from "mongodb-typescript";
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

  await RepositoryManager.groupRepository.save(group)

  user.groups.push(group)
  await RepositoryManager.userRepository.update(user)

  return group
}

export const updateGroup: AuthorizedMethod<GroupUpdateData, Group> = async (user, data) => {
  const group = await getGroup({ id: data.id })

  if (!group) throw Errors.invalidRequest

  group.name = data.name
  group.description = data.description
  group.colorId = data.colorId

  await RepositoryManager.groupRepository.update(group)
  return group
}