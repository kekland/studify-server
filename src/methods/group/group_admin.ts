import { AuthorizedMethod, UnauthorizedMethod } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";
import { GroupCreateData, GroupUpdateData } from "./_data";
import { GroupMethods } from "./group";

export class GroupAdminMethods {
  static createGroup: AuthorizedMethod<GroupCreateData, Group> = async (user, data) => {
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

    return group
  }

  static updateGroup: AuthorizedMethod<GroupUpdateData, Group> = async (user, data) => {
    const group = await GroupMethods.getGroupById(data.id)

    if (!group) throw Errors.invalidRequest

    group.name = data.name
    group.description = data.description
    group.colorId = data.colorId

    await group.save()
    return group
  }
}