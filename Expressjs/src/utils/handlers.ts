import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const wrapHandlers = (func: RequestHandler) => {
  return async (
    req: Request<ParamsDictionary>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
