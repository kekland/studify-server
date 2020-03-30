import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { SignInData, SignUpData, SignInResponse, SignUpResponse } from '../methods/auth/_data'
import { AuthMethods } from '../methods/auth/auth'
import { NotificationMethods } from '../methods/notifications/notifications'
import { SetNotificationsAsReadData } from '../methods/notifications/_data'
import { NoRequestResponse, NoRequestData } from '../methods/utils'
import { UploadFilesResponse } from '../methods/messaging/_data'
import { MessagingMethods } from '../methods/messaging/messaging'

const uploadFiles = generateAuthorizedMethodEndpoint<NoRequestData, UploadFilesResponse>(MessagingMethods.uploadFiles, {
  validateBody: false,
  validateUser: true
})

export const messagingRouter: () => Router = () => {
  const router = Router()

  router.post('/uploadFiles', uploadFiles)

  return router
}