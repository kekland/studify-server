import { AuthorizedMethod, NoRequestData } from "../utils";
import { SendMessageData, SendMessageResponse, PaginatedData, GetMessagesResponse, UploadFilesResponse } from "./_data";
import { GroupMethods } from "../group/group";
import { Errors } from "../../validation/errors";
import { Message, Attachment } from "../../entities/message";
import admin from 'firebase-admin'
import { uuid } from 'uuidv4'

export class MessagingMethods {
  static sendMessage: AuthorizedMethod<SendMessageData, SendMessageResponse> = async (user, data, _, files) => {
    const group = await GroupMethods.getGroupById(data.groupId)

    if (!group) throw Errors.invalidRequest
    if (!user.hasGroup(group)) throw Errors.insufficientPermissions

    const fileData = await MessagingMethods.uploadFiles(user, {}, undefined, files)

    const message = new Message({
      body: data.body,
      attachments: [
        ...(fileData.files.map(f => new Attachment('file', f.url, { name: f.name }))),
      ],
      user: user,
      group: group,
    })

    if (data.replyTo) {
      const replyMessage = await MessagingMethods._getMessage(data.replyTo)
      if (replyMessage)
        message.attachments.push({ type: 'reply', rel: data.replyTo, additional: Message.transformSocket(replyMessage) })
    }

    await message.save()

    await GroupMethods.notifyAllGroupUsers(group, { groupId: group.id, message: message.body, type: 'onMessage', }, user.id)

    return new SendMessageResponse(message, data.idempotencyId)
  }

  static _getMessage = async (id: string) => {
    const message = await Message.findOne(id)

    return message
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

  static uploadFiles: AuthorizedMethod<NoRequestData, UploadFilesResponse> = async (user, _, __, files) => {
    const response = []

    console.log(files)
    for (const fileKey in files) {
      const fileId = uuid()

      const file = files[fileKey]
      const parts = file.name.split('.')
      const extension = parts[parts.length - 1]

      await admin.storage().bucket().file(`${fileId}.${extension}`).save(file.data)
      const url = (await admin.storage().bucket().file(`${fileId}.${extension}`).getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
        version: 'v2',
      })) as any

      response.push({ url, name: file.name })
    }

    return new UploadFilesResponse(response)
  }
}