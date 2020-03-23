import { PermissionLevel } from "./permissions";
import { Request } from 'express'
import { verify } from 'jsonwebtoken'
import { configuration } from "../config";
import { Errors } from "./errors";
import { User } from "../classes/user";
import { RepositoryManager } from "../database/database";
import { ObjectId, ObjectID } from "mongodb";
import { plainToClass } from 'class-transformer'
import { ClassType } from "mongodb-typescript";
import { validate } from 'class-validator'

export interface IValidationSettings<T> {
  permission?: PermissionLevel,
  validateUser?: boolean,
  validateBody?: boolean,
  additionalPermissionChecks?: (user: User | null, data: T) => Promise<boolean>,
  inputClass: ClassType<T>,
}

export const validateRequest = async <T>(req: Request, settings: IValidationSettings<T>): Promise<{ user: User | null, data: T }> => {
  let token = req.headers.authorization
  const permissionLevel = settings.permission ?? 1
  const validateUser = settings.validateUser ?? true
  const validateBody = settings.validateBody ?? true
  const additionalPermissionChecks = settings.additionalPermissionChecks
  const inputClass = settings.inputClass

  try {
    // Verify the JWT token
    let user: User | null = null
    if (validateUser) {
      if (!token || !token.startsWith('Bearer')) throw Errors.invalidAuthentication
      token = token.replace('Bearer ', '')
      
      const payload: any = verify(token, configuration.jwt)
      if (typeof payload === 'string') throw Errors.invalidAuthentication

      const id = payload.id

      // Find the user
      user = await RepositoryManager.userRepository.findById(new ObjectId(id))

      // Validate the user and his permissions
      if (user == null) throw Errors.invalidAuthentication
      if (user.permissionLevel < permissionLevel) throw Errors.insufficientPermissions
    }

    // Validate the body
    const body = req.body
    const data = plainToClass(inputClass, body)

    if (validateBody) {
      const errors = await validate(data)

      if (errors.length > 0) throw Errors.invalidRequest
    }

    // If additional checks are provided, check against them
    if (additionalPermissionChecks) {
      const errored = await additionalPermissionChecks(user, data)
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
