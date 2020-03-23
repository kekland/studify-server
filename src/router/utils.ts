import { IValidationSettings, validateRequest } from "../validation/validation";
import { Request, Response } from "express";
import { User } from "../classes/user";
import { Errors } from "../validation/errors";
import { classToPlain } from "class-transformer";

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
