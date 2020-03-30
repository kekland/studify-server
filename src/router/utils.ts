import { IValidationSettings, validateRequest } from "../validation/validation";
import { Request, Response } from "express";
import { User } from "../entities/user";
import { Errors } from "../validation/errors";
import { classToPlain } from "class-transformer";
import { AuthorizedMethod, UnauthorizedMethod, ParamsType } from "../methods/utils";
import { Logging } from "../logging/logging";

export type Transformer<Res> = (data: NonNullable<Res>) => any
export const defaultTransformer = (data: any) => data

export const generateEndpoint = <Req, Res>(task: (user: User | undefined, data: Req, params: ParamsType, files: any) => Promise<Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return async (req: Request, res: Response) => {
    try {
      Logging.verbose(validation.inputClass?.name ?? 'Endpoint', `${req.ip} at endpoint`)
      const { user, data } = await validateRequest(req, validation)

      Logging.verbose(validation.inputClass?.name ?? 'Endpoint', `${req.ip} is {${user?.id}, ${user?.username}}`)
      const responseBody = await task(user, data, req.params, req.files)
      if (responseBody) {
        res.send(classToPlain(transformer(responseBody as NonNullable<Res>)))
      }
      else {
        res.send()
      }
    }
    catch (e) {
      let errorBody = e
      if (Object.keys(e).length === 0) errorBody = Errors.internalServerError
      if (e.errorCode == 500 || !e.errorCode) Logging.error(validation.inputClass?.name ?? 'Endpoint', e)
      res.status(e.errorCode ?? 500).send(errorBody)
    }
  }
}

export const generateAuthorizedMethodEndpoint = <Req, Res>(method: AuthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return generateEndpoint(async (user, data, params, files) => {
    if (!user) throw Errors.invalidAuthentication
    const res = await method(user, data, params, files)
    return res
  }, validation, transformer)
}

export const generateUnauthorizedMethodEndpoint = <Req, Res>(method: UnauthorizedMethod<Req, Res>, validation: IValidationSettings<Req>, transformer: Transformer<Res> = defaultTransformer) => {
  return generateEndpoint(async (user, data, params) => {
    const res = await method(data, params)
    return res
  }, validation, transformer)
}
