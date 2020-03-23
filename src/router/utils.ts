import { IValidationSettings, validateRequest } from "../validation/validation";
import { Request, Response } from "express";
import { User } from "../classes/user";

export const generateEndpoint = <Req, Res>(task: (user: User | null, data: Req) => Promise<Res>, validation: IValidationSettings<Req>) => {
  return async (req: Request, res: Response) => {
    try {
      const { user, data } = await validateRequest(req, validation)
      const responseBody = await task(user, data)
      res.send(responseBody)
    }
    catch (e) {
      res.status(e.code ?? 500).send(e)
    }
  }
}

export const generateMethodEndpoint = <Req, Res>(task: (user: User | null, data: Req) => Promise<Res>, validation: IValidationSettings<Req>) => {
  return async (req: Request, res: Response) => {
    try {
      const { user, data } = await validateRequest(req, validation)
      const responseBody = await task(user, data)
      res.send(responseBody)
    }
    catch (e) {
      res.status(e.code ?? 500).send(e)
    }
  }
}