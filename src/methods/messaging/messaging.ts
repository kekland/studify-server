import { AuthorizedMethod } from "../utils";
import { SendMessageData, SendMessageResponse } from "./_data";
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

    return new SendMessageResponse(message)
  }
}