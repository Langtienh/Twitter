import HTTP_STATUS from '@/constants/http.status'
import { USERS_MESSAGE } from '@/constants/message'
import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import { verifyToken } from '@/utils/jwt'
import { validate } from '@/utils/revalidator'
import { config } from 'dotenv'
import { checkSchema } from 'express-validator'

config()
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string
const JWT_EMAIL_VERIFY_SECRET = process.env.JWT_EMAIL_VERIFY_SECRET as string
const JWT_FORGOT_PASSWORD_TOKEN_SECRET = process.env
  .JWT_FORGOT_PASSWORD_TOKEN_SECRET as string

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

export const accessTokenValidator = validate(
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
            const decodedAuthorization = await verifyToken({
              token: accessToken,
              secretOrPublicKey: JWT_ACCESS_TOKEN_SECRET
            })
            req.decodedAuthorization = decodedAuthorization
          }
        }
      }
    },
    ['headers']
  )
)

export const logoutValidator = validate(
  checkSchema(
    {
      refreshToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.REFRESH_TOKEN_REQUIED
        },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            await verifyToken({
              token: value,
              secretOrPublicKey: JWT_REFRESH_TOKEN_SECRET
            })
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
          }
        }
      }
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.REFRESH_TOKEN_REQUIED
        },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const decodedRefreshToken = await verifyToken({
              token: value,
              secretOrPublicKey: JWT_REFRESH_TOKEN_SECRET
            })
            req.decodedRefreshToken = decodedRefreshToken
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmail = validate(
  checkSchema(
    {
      emailVerifyToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.VERIFY_EMAIL_TOKEN_REQUIED
        },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const decodedEmailVerifyToken = await verifyToken({
              token: value,
              secretOrPublicKey: JWT_EMAIL_VERIFY_SECRET
            })
            req.decodedEmailVerifyToken = decodedEmailVerifyToken
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
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
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.FORGOT_PASSWORD_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            await verifyToken({
              token: value,
              secretOrPublicKey: JWT_FORGOT_PASSWORD_TOKEN_SECRET
            })
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.FORGOT_PASSWORD_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            await verifyToken({
              token: value,
              secretOrPublicKey: JWT_FORGOT_PASSWORD_TOKEN_SECRET
            })
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
      }
    },
    ['body']
  )
)
