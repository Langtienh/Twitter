import HTTP_STATUS from '@/constants/http.status'
import { USERS_MESSAGE } from '@/constants/message'
import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import { verifyToken } from '@/utils/jwt'
import { validate } from '@/utils/revalidator'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.NAME_REQUIRED
        },
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 63
          },
          errorMessage: USERS_MESSAGE.NAME_LENGTH
        }
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 63
          }
        },
        custom: {
          options: async (value) => {
            const user = await userServices.checkEmailExist(value)
            if (user) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGE.EMAIL_ALREADY_EXISTS
              })
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_REQUIRED
        },
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 63
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGE.PASSWORD_STRENGTH_ERROR
        }
      },
      confirmPassword: {
        isString: { errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_REQUIRED },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGE.PASSWORD_CONFIRMATION_MISMATCH)
            }
            return true
          }
        }
      },
      dateOfBirth: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_REQUIRED
        },
        isDate: { errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_INVALID }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 63
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_REQUIRED
        },
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 63
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGE.PASSWORD_STRENGTH_ERROR
        }
      }
    },
    ['body']
  )
)

export const logoutValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGE.ACCESS_TOKEN_REQUIED },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.replace('Bearer ', '')
            if (accessToken === '')
              throw new Error(USERS_MESSAGE.ACCESS_TOKEN_REQUIED)
            try {
              const decodeAuthorization = await verifyToken({
                token: accessToken
              })
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              throw error
            }
          }
        }
      },
      refreshToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.REFRESH_TOKEN_REQUIED
        },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              await verifyToken({ token: value })
              const refreshTokenDoc =
                await await databaseServices.refreshToken.findOne({
                  refreshToken: value
                })
              if (!refreshTokenDoc) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: USERS_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXIST
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError)
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              throw error
            }
          }
        }
      }
    },
    ['body', 'headers']
  )
)
