import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import { generateEndpoint, generateUnauthorizedMethodEndpoint } from './utils'
import { SignInData, SignUpData, SignInResponse, SignUpResponse } from '../methods/auth/_data'
import { AuthMethods } from '../methods/auth/auth'

const signIn = generateUnauthorizedMethodEndpoint<SignInData, SignInResponse>(AuthMethods.signIn, {
  inputClass: SignInData,
  validateUser: false,
  populateUser: true,
}, SignUpResponse.transform)

const signUp = generateUnauthorizedMethodEndpoint<SignUpData, SignUpResponse>(AuthMethods.signUp, {
  inputClass: SignUpData,
  validateUser: false,
  populateUser: true,
}, SignUpResponse.transform)

export const authRouter: () => Router = () => {
  const router = Router()

  router.post('/signUp', signUp)
  router.post('/signIn', signIn)

  return router
}