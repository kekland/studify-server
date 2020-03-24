import { Socket, Server } from 'socket.io'
import { GroupMethods } from '../methods/group/group'
import { Group } from '../entities/group'
import { generateSocketEventHandler, checkSocketAuthentication } from './utils'
import { SendMessageData, SendMessageResponse, UpdateTypingStatusData } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'
import { Errors } from '../validation/errors'
import { UserMethods } from '../methods/user/user'
import { User } from '../entities/user'
import { Logging } from '../logging/logging'

export class MessagingSocket {
  static async initialize(server: Server) {
    server.on('connection', async (socket) => {
      const userAuthCheck = await checkSocketAuthentication(socket)
      Logging.verbose('MessagingSocket', `Connection from ${socket.handshake.address} with id ${socket.id}`)

      if (!userAuthCheck) {
        socket.disconnect()
        return
      }

      let user = userAuthCheck

      Logging.verbose('MessagingSocket', `${socket.id} authenticated, user is: {${user.id}, ${user.username}}`)

      const socketJoinRooms = () => {
        socket.leaveAll();
        socket.join(socket.id)
        socket.join(user.groups.map(v => v.id))
      }

      socketJoinRooms()
      server.to(socket.id).emit('authorization', { success: true })

      generateSocketEventHandler<SendMessageData>('sendMessage', socket, async (data) => {
        const response = await MessagingMethods.sendMessage(user, data)

        socket.broadcast.to(data.groupId).emit('onNewGroupMessage', SendMessageResponse.transform(response))

        if (data.idempotencyId) {
          server.to(socket.id).emit('onMessageSent', SendMessageResponse.transform(response, data.idempotencyId))
        }
      }, { inputClass: SendMessageData, validateBody: true })

      generateSocketEventHandler<UpdateTypingStatusData>('updateTypingStatus', socket, async (data) => {
        socket.broadcast.to(data.room).emit('onUserTypingStatusUpdated', { user: User.transformMinimal(user), status: data.status })
      }, { inputClass: UpdateTypingStatusData, validateBody: true })

      socket.on('updateRooms', async () => {
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