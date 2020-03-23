import { Socket, Server } from 'socket.io'
import { GroupMethods } from '../methods/group/group'
import { Group } from '../entities/group'
import { generateSocketEventHandler, checkSocketAuthentication } from './utils'
import { SendMessageData, SendMessageResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'
import { Errors } from '../validation/errors'

export class MessagingSocket {
  static async initialize(server: Server) {
    server.on('connection', async (socket) => {
      const user = await checkSocketAuthentication(socket)
      if (!user) {
        socket.disconnect()
        return
      }

      user.groups.forEach(group => socket.join(group.id))

      generateSocketEventHandler<SendMessageData, SendMessageResponse>('message', 'messageSent', socket, async (data) => {
        const response = await MessagingMethods.sendMessage(user, data)

        socket.to(data.groupId).send(SendMessageResponse.transform(response))

        return response
      }, { inputClass: SendMessageData }, SendMessageResponse.transform)

      socket.on('joinRoom', async (room: string) => {
        const group = await GroupMethods.getGroupById(room)

        if (!group) socket.error(Errors.invalidRequest)
        else socket.join(group.id)
      })

      socket.on('leaveRoom', async (room: string) => {
        if (socket.rooms[room]) {
          socket.leave(room)
        }
      })
    })
  }
}