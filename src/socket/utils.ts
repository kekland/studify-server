import { Socket } from 'socket.io'
import { User } from '../entities/user'
import { IValidationSettings, validateSocketRequest } from '../validation/validation'
import { defaultTransformer, Transformer } from '../router/utils'
import { classToPlain } from 'class-transformer'
import { Errors } from '../validation/errors'
import { Logging } from '../logging/logging'

export const generateSocketEventHandler = <Req>
  (event: string, socket: Socket,
    task: (data: Req) => Promise<void>,
    validation: IValidationSettings<Req>) => {
  socket.on(event, async (body) => {
    Logging.verbose(validation.inputClass?.name ?? 'MessagingSocket', `Emitted by ${socket.id}`)
    try {
      let contents = (typeof body === 'object') ? body : JSON.parse(body)
      const { user, data } = await validateSocketRequest(socket, contents, {
        inputClass: validation.inputClass,
        validateBody: validation.validateBody,
        populateUser: true,
        validateUser: true,
      })

      await task(data)
    }
    catch (e) {
      let errorBody = e
      if (Object.keys(e).length === 0) errorBody = Errors.internalServerError
      if (e.errorCode == 500 || !e.errorCode) Logging.error(validation.inputClass?.name ?? 'Endpoint', e)
      socket.to(socket.id).error(errorBody)
    }
  })
}

export const checkSocketAuthentication = async (socket: Socket): Promise<User | undefined> => {
  try {
    const { user } = await validateSocketRequest(socket, {}, { validateBody: false, populateUser: true, validateUser: true })
    return user
  }
  catch (e) {
    let errorBody = e
    if (errorBody == {}) errorBody = Errors.internalServerError
    socket.to(socket.id).error(errorBody)
  }
}