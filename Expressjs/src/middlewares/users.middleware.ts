import { UserVerifyStatus } from '@/constants/enum'
import HTTP_STATUS from '@/constants/http.status'
import USERS_MESSAGE from '@/constants/message/user.message'
import { AccessTokenPayload } from '@/models/dto/payload'
import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import { verifyToken } from '@/utils/jwt'
import { validate } from '@/utils/revalidator'
import { config } from 'dotenv'
import { checkSchema, ParamSchema } from 'express-validator'

config()
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string
const JWT_EMAIL_VERIFY_SECRET = process.env.JWT_EMAIL_VERIFY_SECRET as string
const JWT_FORGOT_PASSWORD_TOKEN_SECRET = process.env
  .JWT_FORGOT_PASSWORD_TOKEN_SECRET as string

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.validation.password.required
  },
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 63
    },
    errorMessage: USERS_MESSAGE.validation.password.length
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGE.validation.password.strengthError
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.validation.name.required
  },
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.validation.name.length
  }
}

const newEmailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.validation.email.required
  },
  isEmail: {
    errorMessage: USERS_MESSAGE.validation.email.invalid
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.validation.email.length
  },
  custom: {
    options: async (value) => {
      const user = await userServices.checkEmailExist(value)
      if (user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGE.validation.email.alreadyExists
        })
      }
      return true
    }
  }
}

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.validation.email.required
  },
  isEmail: {
    errorMessage: USERS_MESSAGE.validation.email.invalid
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.validation.email.length
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGE.validation.password.confirmation.required
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGE.validation.password.confirmation.mismatch)
      }
      return true
    }
  }
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.validation.dateOfBirth.required
  },
  isDate: { errorMessage: USERS_MESSAGE.validation.dateOfBirth.invalid }
}

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: newEmailSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      dateOfBirth: dateOfBirthSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: passwordSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGE.token.accessToken.required },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.replace('Bearer ', '')
            if (accessToken === '')
              throw new Error(USERS_MESSAGE.token.accessToken.required)
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
          errorMessage: USERS_MESSAGE.token.refreshToken.required
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
                message: USERS_MESSAGE.token.usedOrNotExist
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
          errorMessage: USERS_MESSAGE.token.refreshToken.required
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
          errorMessage: USERS_MESSAGE.token.verifyEmailToken.required
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
      email: emailSchema
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.passwordReset.forgotPasswordRequired
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
          errorMessage: USERS_MESSAGE.passwordReset.forgotPasswordRequired
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
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema
    },
    ['body']
  )
)
/**
 * verify token format, exp, user-status: baned or unverify
 */
export const verifyUser = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGE.token.accessToken.required },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.replace('Bearer ', '')
            if (accessToken === '')
              throw new Error(USERS_MESSAGE.token.accessToken.required)
            const decodedAuthorization = await verifyToken({
              token: accessToken,
              secretOrPublicKey: JWT_ACCESS_TOKEN_SECRET
            })
            const { verify } = decodedAuthorization as AccessTokenPayload
            if (verify === UserVerifyStatus.Unverify) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.FORBIDDEN,
                message: USERS_MESSAGE.account.unverified
              })
            } else if (verify === UserVerifyStatus.Banbed) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.LOCKED,
                message: USERS_MESSAGE.account.locked
              })
            }
            req.decodedAuthorization = decodedAuthorization
          }
        }
      }
    },
    ['headers']
  )
)
export const updateUserValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      dateOfBirth: {
        ...dateOfBirthSchema,
        optional: true,
        notEmpty: undefined
      },
      bio: {
        optional: true,
        isLength: {
          options: {
            max: 200
          },
          errorMessage: USERS_MESSAGE.validation.bio.isLength
        }
      },
      localtion: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            max: 200
          },
          errorMessage: USERS_MESSAGE.validation.location.isLength
        }
      },
      website: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            max: 200
          },
          errorMessage: USERS_MESSAGE.validation.website.isLength
        }
      },
      username: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USERS_MESSAGE.validation.username.isLength
        }
      },
      coverPhoto: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGE.validation.coverPhoto.isLength
        }
      },
      avatar: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGE.validation.avatar.isLength
        }
      }
    },
    ['body']
  )
)
