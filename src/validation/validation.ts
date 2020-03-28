import { PermissionLevel } from "./permissions";
import { Request } from 'express'
import { verify } from 'jsonwebtoken'
import { configuration } from "../config-heroku";
import { Errors } from "./errors";
import { User } from "../entities/user";
import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { ClassType } from "class-transformer/ClassTransformer";
import { UserMethods } from "../methods/user/user";
import { Socket } from "socket.io";
import { SendMessageData } from "../methods/messaging/_data";

export interface IValidationSettings<T> {
  permission?: PermissionLevel,
  validateUser?: boolean,
  validateBody?: boolean,
  populateUser?: boolean,
  additionalPermissionChecks?: (user: User, data: T) => Promise<boolean>,
  inputClass?: ClassType<T>,
}

export const validateRequest = async <T>(req: Request, settings: IValidationSettings<T>): Promise<{ user: User | undefined, data: T }> => {
  let token = req.headers.authorization
  const permissionLevel = settings.permission ?? 1
  const validateUser = settings.validateUser ?? true
  const validateBody = settings.validateBody ?? true
  const populateUser = settings.populateUser ?? true
  const additionalPermissionChecks = settings.additionalPermissionChecks
  const inputClass = settings.inputClass

  try {
    // Verify the JWT token
    let user: User | undefined
    if (validateUser) {
      if (!token || !token.startsWith('Bearer')) throw Errors.invalidAuthentication
      token = token.replace('Bearer ', '')

      const payload: any = verify(token, configuration.jwt)
      if (typeof payload === 'string') throw Errors.invalidAuthentication

      const id = payload.id

      // Find the user
      user = await UserMethods.findUser({ id }, populateUser)

      // Validate the user and his permissions
      if (user == null) throw Errors.invalidAuthentication
      if (user.permissionLevel < permissionLevel) throw Errors.insufficientPermissions
    }

    let data: T = (req.body as T)
    // Transform the body
    if (inputClass) {
      const body = { ...req.body, ...req.query }
      data = plainToClass(inputClass, body)
    }

    // Validate the body
    if (validateBody) {
      const errors = await validate(data)

      if (errors.length > 0) throw Errors.invalidRequest
    }

    // If additional checks are provided, check against them
    if (validateUser && additionalPermissionChecks) {
      const errored = await additionalPermissionChecks(user as User, data)
      if (errored) throw Errors.insufficientPermissions
    }

    return { user, data }
  }
  catch (e) {
    if (e === Errors.invalidRequest) throw Errors.invalidRequest
    if (e === Errors.insufficientPermissions) throw Errors.insufficientPermissions
    else throw Errors.invalidAuthentication
  }
}

export const validateSocketRequest = async <T>(socket: Socket, body: any, settings: IValidationSettings<T>): Promise<{ user: User | undefined, data: T }> => {
  let token = socket.handshake.query?.token
  const permissionLevel = settings.permission ?? 1
  const validateUser = settings.validateUser ?? true
  const validateBody = settings.validateBody ?? true
  const populateUser = settings.populateUser ?? true
  const additionalPermissionChecks = settings.additionalPermissionChecks
  const inputClass = settings.inputClass

  try {
    // Verify the JWT token
    let user: User | undefined
    if (validateUser) {
      if (!token) throw Errors.invalidAuthentication
      token = token.replace('Bearer ', '')

      const payload: any = verify(token, configuration.jwt)
      if (typeof payload === 'string') throw Errors.invalidAuthentication

      const id = payload.id

      // Find the user
      user = await UserMethods.findUser({ id }, populateUser)

      // Validate the user and his permissions
      if (user == null) throw Errors.invalidAuthentication
      if (user.permissionLevel < permissionLevel) throw Errors.insufficientPermissions
    }

    let data: T = (body as T)
    // Transform the body
    if (validateBody) {
      data = plainToClass(inputClass as ClassType<T>, data)
    }

    // Validate the body
    if (validateBody) {
      const errors = await validate(data)

      if (errors.length > 0) throw Errors.invalidRequest
    }

    // If additional checks are provided, check against them
    if (validateUser && additionalPermissionChecks) {
      const errored = await additionalPermissionChecks(user as User, data)
      if (errored) throw Errors.insufficientPermissions
    }

    return { user, data }
  }
  catch (e) {
    if (e === Errors.invalidRequest) throw Errors.invalidRequest
    if (e === Errors.insufficientPermissions) throw Errors.insufficientPermissions
    else throw Errors.invalidAuthentication
  }
}
