import { AuthorizedMethod, UnauthorizedMethod } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";
import { GroupCreateData, GroupUpdateData } from "./_data";
import { GroupMethods } from "./group";
import { MessagingSocket } from "../../socket/messaging";

export class GroupAdminMethods {
  static createGroup: AuthorizedMethod<GroupCreateData, Group> = async (user, data) => {
    const group = new Group({
      name: data.name,
      description: data.description,
      colorId: data.colorId,
      creator: user,
      icon: data.icon,
    })

    await group.save()

    user.groups.push(group)
    user.createdGroups.push(group)
    await user.save()

    return group
  }

  static updateGroup: AuthorizedMethod<GroupUpdateData, Group> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest
    const group = await GroupMethods.getGroupById(groupId)

    if (!group) throw Errors.invalidRequest
    if (group.creator.id !== user.id) throw Errors.insufficientPermissions

    group.name = data.name
    group.description = data.description
    group.colorId = data.colorId
    group.icon = data.icon

    await group.save()

    await MessagingSocket.onGroupChange(group)

    return group
  }
}