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
      console.log(user)
      if (!user) {
        socket.disconnect()
        return
      }

      socket.join(user.groups.map(v => v.id))
      server.to(socket.id).emit('authorization', { success: true })

      generateSocketEventHandler<SendMessageData, SendMessageResponse>('messageSend', socket, async (data) => {
        console.log(data)
        const response = await MessagingMethods.sendMessage(user, data)

        console.log(data.groupId, 'alih umer!!!')
        socket.broadcast.to(data.groupId).emit('newGroupMessage', SendMessageResponse.transform(response))

        if (data.idempotencyId) {
          console.log(socket.rooms, socket.id, data.idempotencyId)
          server.to(socket.id).emit('messageSent', SendMessageResponse.transform(response, data.idempotencyId))
        }

        return response
      }, { inputClass: SendMessageData, validateBody: true })

      socket.on('joinRoom', async (room: string) => {
        try {
          const group = await GroupMethods.getGroupById(room)

          if (!group) socket.to(socket.id).error(Errors.invalidRequest)
          else socket.join(group.id)
        }
        catch (e) {
          socket.to(socket.id).error(e)
        }
      })

      socket.on('leaveRoom', async (room: string) => {
        if (socket.rooms[room]) {
          socket.leave(room)
        }
      })
    })
  }
}