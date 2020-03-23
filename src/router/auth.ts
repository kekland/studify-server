import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import * as AuthMethods from '../methods/auth'
import { generateEndpoint, generateUnauthorizedMethodEndpoint } from './utils'

const signIn = generateUnauthorizedMethodEndpoint<AuthMethods.SignInData, AuthMethods.SignInResponse>(AuthMethods.signIn, {
  inputClass: AuthMethods.SignInData,
  validateUser: false,
})

const signUp = generateUnauthorizedMethodEndpoint<AuthMethods.SignUpData, AuthMethods.SignUpResponse>(AuthMethods.signUp, {
  inputClass: AuthMethods.SignUpData,
  validateUser: false,
})

export const authRouter: () => Router = () => {
  const router = Router()

  router.post('/signUp', signUp)
  router.post('/signIn', signIn)

  return router
}