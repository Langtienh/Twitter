import HTTP_STATUS from '@/constants/http.status'
import { USERS_MASSAGE } from '@/constants/message'
import { EntityError, ErrorWithMessage } from '@/models/schemas/Error'
import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

// can be reused by many routes
export const validate = (
  validations: RunnableValidationChains<ValidationChain>
) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    await validations.run(req)
    const errors = validationResult(req)
    // không có lỗi => chạy tiếp
    if (errors.isEmpty()) {
      return next()
    }
    // có lỗi khác lỗi validation entity thì suất lỗi
    const errorObject = errors.mapped()
    for (const key in errorObject) {
      const { msg } = errorObject[key]
      if (
        msg instanceof ErrorWithMessage &&
        msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY
      ) {
        return next(msg)
      }
    }

    // trả lỗi entity
    next(
      new EntityError({
        message: USERS_MASSAGE.VALIDATION_ERROR,
        errors: errorObject
      })
    )
  }
}
