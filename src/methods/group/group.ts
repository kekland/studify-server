import { GroupGetResponse, GroupGetData, GroupGetMultipleResponse, GroupGetAllData, GroupJoinData, GroupJoinResponse, GroupLeaveData, GroupLeaveResponse, GroupGetUsersResponse, GroupLoadDataResponse, GroupLoadAllDataResponse, SearchGroupsData, SearchGroupsResponse } from "./_data";
import { UnauthorizedMethod, AuthorizedMethod, NoRequestData } from "../utils";
import { Group } from "../../entities/group";
import { Errors } from "../../validation/errors";
import { PaginatedData } from "../messaging/_data";
import { User } from "../../entities/user";
import { MessagingMethods } from "../messaging/messaging";
import { NotificationMethods } from "../notifications/notifications";
import { INotification, INotificationBody } from "../../entities/notification";
import { MessagingSocket } from "../../socket/messaging";
import { Like } from "typeorm";

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

  static _getGroupUsers = async (groupId: string, data: { limit?: number, skip?: number }): Promise<User[]> => {
    let query = User
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('group.id=:groupId', { groupId })

    if (data.limit) query = query.take(data.limit)
    if (data.skip) query = query.skip(data.skip)

    return query.getMany()
  }

  static getGroupUsers: AuthorizedMethod<PaginatedData, GroupGetUsersResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)
    if (!group) throw Errors.invalidRequest

    if (!user.hasGroup(group)) throw Errors.invalidRequest

    const users = await GroupMethods._getGroupUsers(group.id, data)
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

    await MessagingSocket.onGroupChange(group)

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

    await MessagingSocket.onGroupChange(group)

    return new GroupJoinResponse(group);
  }

  static notifyAllGroupUsers = async (group: Group, notificationData: INotificationBody, author?: string) => {
    const users = await GroupMethods._getGroupUsers(group.id, {})

    for (const user of users) {
      if (user.id === author) continue
      await NotificationMethods.pushNotification({ userId: user.id, ...notificationData })
    }
  }

  static _loadData = async (user: User, group: Group) => {
    const groupId = group.id

    const lastMessages = await MessagingMethods.getMessages(user, { limit: 20, skip: 0 }, { groupId })
    const unreadMessages = await NotificationMethods.getNotificationCount(user, { groupId, type: 'onMessage' })

    return new GroupLoadDataResponse(group, lastMessages.messages, unreadMessages, undefined)
  }

  static loadData: AuthorizedMethod<NoRequestData, GroupLoadDataResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)

    if (!group) throw Errors.invalidRequest

    return GroupMethods._loadData(user, group)
  }

  static loadAllData: AuthorizedMethod<NoRequestData, GroupLoadAllDataResponse> = async (user, data, params) => {
    const response = await Promise.all(user.groups.map((group) => GroupMethods._loadData(user, group)))

    return new GroupLoadAllDataResponse(response)
  }

  static searchGroups: UnauthorizedMethod<SearchGroupsData, SearchGroupsResponse> = async (data) => {
    const response = await Group.find({
      where: data.query ? [{ name: Like(`%${data.query}%`) }] : [],
      skip: data.skip,
      take: data.limit,
      order: {
        userCount: 'DESC',
      }
    })

    return new SearchGroupsResponse(response)
  }
}
