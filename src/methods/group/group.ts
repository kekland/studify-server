import { GroupGetResponse, GroupGetData, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveData, GroupLeaveResponse } from "./_data";
import { UnauthorizedMethod, AuthorizedMethod } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";

export class GroupMethods {
  static async getGroupById(id: string): Promise<Group | undefined> {
    const group = await Group.findOne(id)
    return group
  }

  static async getAllGroups(): Promise<Group[]> {
    const groups = await Group.find()
    return groups
  }

  static getGroup: UnauthorizedMethod<GroupGetData, GroupGetResponse> = async (data, params) => {
    const groupId = params?.groupId
    if (!groupId) return new GroupGetResponse(undefined);

    const group = await GroupMethods.getGroupById(groupId)
    return new GroupGetResponse(group)
  }

  static getGroups: UnauthorizedMethod<GroupGetAllData, GroupGetMultipleResponse> = async (data) => {
    const groups = await GroupMethods.getAllGroups()
    return new GroupGetMultipleResponse(groups)
  }

  static joinGroup: AuthorizedMethod<GroupJoinData, GroupJoinResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    user.groups.push(group)
    await user.save()

    return new GroupJoinResponse(group);
  }

  static leaveGroup: AuthorizedMethod<GroupLeaveData, GroupLeaveResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    user.groups.splice(user.groups.findIndex(g => g.id === groupId), 1)
    await user.save()

    return new GroupJoinResponse(group);
  }
}
