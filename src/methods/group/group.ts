import { GroupGetResponse, GroupGetData, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveData, GroupLeaveResponse, GroupGetUsersResponse, GroupLoadDataResponse, GroupLoadAllDataResponse } from "./_data";
import { UnauthorizedMethod, AuthorizedMethod, NoRequestData } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";
import { PaginatedData } from "../messaging/_data";
import { User } from "../../entities/user";
import { MessagingMethods } from "../messaging/messaging";
import { NotificationMethods } from "../notifications/notifications";

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
    const groups = await GroupMethods.getAllGroups()
    return new GroupGetMultipleResponse(groups)
  }

  static getGroupUsers: AuthorizedMethod<PaginatedData, GroupGetUsersResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    if (!user.hasGroup(group)) throw Errors.invalidRequest

    const users = await User
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('group.id=:groupId', { groupId })
      .take(data.limit)
      .skip(data.skip)
      .getMany()

    return new GroupGetUsersResponse(users)
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
    if (group.creator.id === user.id) throw Errors.invalidRequest

    user.groups.splice(user.groups.findIndex(g => g.id === groupId), 1)
    await user.save()

    group.userCount -= 1
    await group.save()

    return new GroupJoinResponse(group);
  }

  static loadData: AuthorizedMethod<NoRequestData, GroupLoadDataResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)

    if (!group) throw Errors.invalidRequest

    const lastMessages = await MessagingMethods.getMessages(user, { limit: 20, skip: 0 }, { groupId })

    const unreadMessages = await NotificationMethods.getNotificationCount(user, { groupId, type: 'onMessage' })

    return new GroupLoadDataResponse(group, lastMessages.messages, unreadMessages, undefined)
  }

  static loadAllData: AuthorizedMethod<NoRequestData, GroupLoadAllDataResponse> = async (user, data, params) => {
    const response = await Promise.all(user.groups.map((group) => GroupMethods.loadData(user, {}, { groupId: group.id })))

    return new GroupLoadAllDataResponse(response)
  }
}
