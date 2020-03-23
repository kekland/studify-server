import { Router, Request, Response } from 'express'
import { validateRequest } from '../validation/validation'
import * as AuthMethods from '../methods/auth'
import { generateEndpoint } from './utils'

const signIn = generateEndpoint<AuthMethods.SignInData, AuthMethods.SignInResponse>(async (_, data) => {
  const response = await AuthMethods.signIn(data)
  return response
}, {
  inputClass: AuthMethods.SignInData,
  validateUser: false,
})

const signUp = generateEndpoint<AuthMethods.SignUpData, AuthMethods.SignUpResponse>(async (_, data) => {
  const response = await AuthMethods.signUp(data)
  return response
}, {
  inputClass: AuthMethods.SignUpData,
  validateUser: false,
})

export const authRouter: () => Router = () => {
  const router = Router()

  router.post('/signUp', signUp)
  router.post('/signIn', signIn)
  
  return router
}