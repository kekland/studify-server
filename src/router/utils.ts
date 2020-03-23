import { IValidationSettings, validateRequest } from "../validation/validation";
import { Request, Response } from "express";
import { User } from "../entities/user";
import { Errors } from "../validation/errors";
import { classToPlain } from "class-transformer";
import { AuthorizedMethod, UnauthorizedMethod } from "../methods/utils";

type Transformer<Res> = (data: NonNullable<Res>) => any
const defaultTransformer = (data: any) => data

export const generateEndpoint = <Req, Res>(task: (user: User | undefined, data: Req) => Promise<Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return async (req: Request, res: Response) => {
    try {
      const { user, data } = await validateRequest(req, validation)
      const responseBody = await task(user, data)
      if (responseBody) {
        res.send(classToPlain(transformer(responseBody as NonNullable<Res>)))
      }
      else {
        res.send()
      }
    }
    catch (e) {
      let errorBody = e
      if (errorBody == {}) errorBody = Errors.internalServerError
      res.status(e.errorCode ?? 500).send(errorBody)
    }
  }
}

export const generateAuthorizedMethodEndpoint = <Req, Res>(method: AuthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return generateEndpoint(async (user, data) => {
    if (!user) throw Errors.invalidAuthentication
    const res = await method(user, data)
    return res
  }, validation, transformer)
}

export const generateUnauthorizedMethodEndpoint = <Req, Res>(method: UnauthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return generateEndpoint(async (user, data) => {
    const res = await method(data)
    return res
  }, validation, transformer)
}
