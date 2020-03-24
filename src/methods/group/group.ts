import { GroupGetResponse, GroupGetData, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveData, GroupLeaveResponse, GroupGetUsersResponse } from "./_data";
import { UnauthorizedMethod, AuthorizedMethod } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";
import { PaginatedData } from "../messaging/_data";

export class GroupMethods {
  static async getGroupById(id: string): Promise<Group | undefined> {
    const group = await Group.findOne(id)
    return group
  }

  static async getAllGroups(): Promise<Group[]> {
    const groups = await Group.createQueryBuilder('group')
      .getMany()
    return groups
  }

  static getGroup: UnauthorizedMethod<GroupGetData, GroupGetResponse> = async (data, params) => {
    const groupId = params?.groupId
    if (!groupId) return new GroupGetResponse(undefined);

    const group = await GroupMethods.getGroupById(groupId)
    return new GroupGetResponse(group)
  }

  static getGroups: UnauthorizedMethod<GroupGetAllData, GroupGetMultipleResponse> = async (data) => {
    console.log(data)
    const groups = await GroupMethods.getAllGroups()
    return new GroupGetMultipleResponse(groups)
  }

  static getGroupUsers: AuthorizedMethod<PaginatedData, GroupGetUsersResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    if (user.hasGroup(group)) throw Errors.invalidRequest
    
    const users = await Group
      .createQueryBuilder('group')
      .where('group.id=:groupId', { groupId })
      .leftJoinAndSelect('group.users', 'user')
      .select('group.users')
      .take(data.limit)
      .skip(data.skip)
      .getMany()

    console.log(users)

    return new GroupGetUsersResponse([])
  }

  static joinGroup: AuthorizedMethod<GroupJoinData, GroupJoinResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    if (user.hasGroup(group)) throw Errors.invalidRequest

    user.groups.push(group)
    await user.save()

    group.userCount += 1
    await group.save()

    return new GroupJoinResponse(group);
  }

  static leaveGroup: AuthorizedMethod<GroupLeaveData, GroupLeaveResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    if (!user.hasGroup(group)) throw Errors.invalidRequest

    user.groups.splice(user.groups.findIndex(g => g.id === groupId), 1)
    await user.save()

    group.userCount -= 1
    await group.save()

    return new GroupJoinResponse(group);
  }
}
