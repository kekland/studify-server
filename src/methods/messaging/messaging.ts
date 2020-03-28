import { AuthorizedMethod } from "../utils";
import { SendMessageData, SendMessageResponse, PaginatedData, GetMessagesResponse } from "./_data";
import { GroupMethods } from "../group/group";
import { Errors } from "../../validation/errors";
import { Message } from "../../entities/message";

export class MessagingMethods {
  static sendMessage: AuthorizedMethod<SendMessageData, SendMessageResponse> = async (user, data) => {
    const group = await GroupMethods.getGroupById(data.groupId)

    if (!group) throw Errors.invalidRequest
    if (!user.hasGroup(group)) throw Errors.insufficientPermissions

    const message = new Message({
      body: data.body,
      attachments: data.attachments,
      user: user,
      group: group,
    })

    await message.save()

    await GroupMethods.notifyAllGroupUsers(group, { groupId: group.id, message: message.body, type: 'onMessage', })

    return new SendMessageResponse(message)
  }

  static getMessages: AuthorizedMethod<PaginatedData, GetMessagesResponse> = async (user, data, params) => {
    const groupId = params?.groupId
    if (!groupId) throw Errors.invalidRequest

    const group = await GroupMethods.getGroupById(groupId)

    if (!group) throw Errors.invalidRequest
    if (!user.hasGroup(group)) throw Errors.insufficientPermissions

    const messages = await Message.createQueryBuilder('message').where('message.group = :groupId', { groupId: group.id })
      .skip(data.skip)
      .take(data.limit)
      .leftJoinAndSelect('message.user', 'user')
      .orderBy('message.created', 'DESC')
      .getMany()

    messages.forEach(message => message.groupId = group.id)
    return new GetMessagesResponse(messages)
  }
}