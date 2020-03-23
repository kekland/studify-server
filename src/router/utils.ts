import { IValidationSettings, validateRequest } from "../validation/validation";
import { Request, Response } from "express";
import { User } from "../classes/user";
import { Errors } from "../validation/errors";
import { classToPlain } from "class-transformer";
import { AuthorizedMethod, UnauthorizedMethod } from "../methods/utils";

export const generateEndpoint = <Req, Res>(task: (user: User | null, data: Req) => Promise<Res>, validation: IValidationSettings<Req>, outputCaster: (data: Res) => any = classToPlain) => {
  return async (req: Request, res: Response) => {
    try {
      const { user, data } = await validateRequest(req, validation)
      console.log()
      const responseBody = await task(user, data)
      res.send(outputCaster(responseBody))
    }
    catch (e) {
      res.status(e.code ?? 500).send(e ?? Errors.internalServerError)
    }
  }
}

export const generateAuthorizedMethodEndpoint = <Req, Res>(method: AuthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, outputCaster: (data: Res) => any = classToPlain) => {
  return generateEndpoint(async (user, data) => {
    if (!user) throw Errors.invalidAuthentication
    const res = await method(user, data)
    return res
  }, validation, outputCaster)
}

export const generateUnauthorizedMethodEndpoint = <Req, Res>(method: UnauthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, outputCaster: (data: Res) => any = classToPlain) => {
  return generateEndpoint(async (user, data) => {
    const res = await method(data)
    return res
  }, validation, outputCaster)
}
