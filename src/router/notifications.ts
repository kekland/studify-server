import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { SignInData, SignUpData, SignInResponse, SignUpResponse } from '../methods/auth/_data'
import { AuthMethods } from '../methods/auth/auth'
import { NotificationMethods } from '../methods/notifications/notifications'
import { SetNotificationsAsReadData } from '../methods/notifications/_data'
import { NoRequestResponse } from '../methods/utils'

const setNotificationsAsRead =
  generateAuthorizedMethodEndpoint<SetNotificationsAsReadData, NoRequestResponse>(NotificationMethods.setNotificationsAsRead, {
    inputClass: SetNotificationsAsReadData,
  })

export const notificationsRouter: () => Router = () => {
  const router = Router()

  router.post('/setRead', setNotificationsAsRead)

  return router
}