import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import { generateEndpoint, generateUnauthorizedMethodEndpoint, generateAuthorizedMethodEndpoint } from './utils'
import { SignInData, SignUpData, SignInResponse, SignUpResponse, SignInWithTokenResponse } from '../methods/auth/_data'
import { AuthMethods } from '../methods/auth/auth'

const signIn = generateUnauthorizedMethodEndpoint(AuthMethods.signIn, {
  inputClass: SignInData,
  validateUser: false,
  populateUser: true,
}, SignUpResponse.transform)

const signUp = generateUnauthorizedMethodEndpoint(AuthMethods.signUp, {
  inputClass: SignUpData,
  validateUser: false,
  populateUser: true,
}, SignUpResponse.transform)

const signInWithToken = generateAuthorizedMethodEndpoint(AuthMethods.signInWithToken, {
  validateUser: true,
  validateBody: false,
}, SignInWithTokenResponse.transform)

export const authRouter: () => Router = () => {
  const router = Router()

  router.post('/signUp', signUp)
  router.post('/signIn', signIn)
  router.post('/signInWithToken', signInWithToken)

  return router
}