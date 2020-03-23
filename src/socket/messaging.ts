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

      user.groups.forEach(group => socket.join(group.id))
      server.to(socket.id).emit('authorization', { success: true })

      console.log('joined all groups')
      generateSocketEventHandler<SendMessageData, SendMessageResponse>('messageSend', socket, async (data) => {
        const response = await MessagingMethods.sendMessage(user, data)

        server.to(data.groupId).emit('messageSend', SendMessageResponse.transform(response))

        return response
      }, { inputClass: SendMessageData })

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