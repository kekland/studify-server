import { Socket } from 'socket.io'
import { User } from '../entities/user'
import { IValidationSettings, validateSocketRequest } from '../validation/validation'
import { defaultTransformer, Transformer } from '../router/utils'
import { classToPlain } from 'class-transformer'
import { Errors } from '../validation/errors'

export const generateSocketEventHandler = <Req, Res>
  (event: string, message: string, socket: Socket,
    task: (data: Req) => Promise<Res>,
    validation: IValidationSettings<Req>,
    transformer: Transformer<Res> = defaultTransformer) => {
  return socket.on(event, async (body) => {
    try {
      const { user, data } = await validateSocketRequest(socket, body, {
        inputClass: validation.inputClass,
        validateBody: validation.validateBody,
        populateUser: false,
        validateUser: false,
      })
      const responseBody = await task(data)
      if (responseBody) {
        socket.to(socket.id).emit(message, classToPlain(transformer(responseBody as NonNullable<Res>)))
      }
      else {
        socket.to(socket.id).emit(message, {})
      }
    }
    catch (e) {
      let errorBody = e
      if (errorBody == {}) errorBody = Errors.internalServerError
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