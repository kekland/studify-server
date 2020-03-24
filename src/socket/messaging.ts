import { Socket, Server } from 'socket.io'
import { GroupMethods } from '../methods/group/group'
import { Group } from '../entities/group'
import { generateSocketEventHandler, checkSocketAuthentication } from './utils'
import { SendMessageData, SendMessageResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'
import { Errors } from '../validation/errors'
import { UserMethods } from '../methods/user/user'
import { User } from '../entities/user'

export class MessagingSocket {
  static async initialize(server: Server) {
    server.on('connection', async (socket) => {
      const userAuthCheck = await checkSocketAuthentication(socket)

      if (!userAuthCheck) {
        socket.disconnect()
        return
      }

      let user = userAuthCheck

      const socketJoinRooms = () => {
        socket.leaveAll();
        socket.join(user.groups.map(v => v.id))
      }

      socketJoinRooms()
      server.to(socket.id).emit('authorization', { success: true })

      generateSocketEventHandler<SendMessageData, SendMessageResponse>('messageSend', socket, async (data) => {
        const response = await MessagingMethods.sendMessage(user, data)

        socket.broadcast.to(data.groupId).emit('newGroupMessage', SendMessageResponse.transform(response))

        if (data.idempotencyId) {
          server.to(socket.id).emit('messageSent', SendMessageResponse.transform(response, data.idempotencyId))
        }

        return response
      }, { inputClass: SendMessageData, validateBody: true })

      socket.on('updateRooms', async (room: string) => {
        try {
          user = await UserMethods.findUser({ id: user.id }, true) as User
          socketJoinRooms()
        }
        catch (e) {
          socket.to(socket.id).error(e)
        }
      })
    })
  }
}