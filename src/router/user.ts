import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { SignInData, SignUpData, SignInResponse, SignUpResponse } from '../methods/auth/_data'
import { AuthMethods } from '../methods/auth/auth'
import { NotificationMethods } from '../methods/notifications/notifications'
import { SetNotificationsAsReadData } from '../methods/notifications/_data'
import { NoRequestResponse, NoRequestData } from '../methods/utils'
import { UserMethods } from '../methods/user/user'
import { UserDataResponse } from '../methods/user/_data'

const getUser = generateAuthorizedMethodEndpoint(UserMethods.getUserData, {
  inputClass: NoRequestData,
  validateBody: false,
  validateUser: true
}, UserDataResponse.transform)

export const usersRouter: () => Router = () => {
  const router = Router()

  router.get('/:userId/', getUser)

  return router
}