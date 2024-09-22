import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapHandlers = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}
