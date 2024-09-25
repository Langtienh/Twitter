import { UserVerifyStatus } from '@/constants/enum'
import HTTP_STATUS from '@/constants/http.status'
import USERS_MESSAGE from '@/constants/message/user.message'
import { usernameRegexr } from '@/constants/regexr'
import { AccessTokenPayload } from '@/models/dto/payload'
import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import { verifyToken } from '@/utils/jwt'
import { validate } from '@/utils/revalidator'
import { config } from 'dotenv'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

config()
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string
const JWT_EMAIL_VERIFY_SECRET = process.env.JWT_EMAIL_VERIFY_SECRET as string
const JWT_FORGOT_PASSWORD_TOKEN_SECRET = process.env
  .JWT_FORGOT_PASSWORD_TOKEN_SECRET as string

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.password.required
  },
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 63
    },
    errorMessage: USERS_MESSAGE.field.password.length
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGE.field.password.strengthError
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.name.required
  },
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.field.name.length
  }
}

const newEmailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.email.required
  },
  isEmail: {
    errorMessage: USERS_MESSAGE.field.email.invalid
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.field.email.length
  },
  custom: {
    options: async (value) => {
      const user = await userServices.getUserByEmail(value)
      if (user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGE.field.email.alreadyExists
        })
      }
      return true
    }
  }
}

const emailSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.email.required
  },
  isEmail: {
    errorMessage: USERS_MESSAGE.field.email.invalid
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 63
    },
    errorMessage: USERS_MESSAGE.field.email.length
  }
}

const confirmPasswordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGE.field.password.confirmation.required
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGE.field.password.confirmation.mismatch)
      }
      return true
    }
  }
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.dateOfBirth.required
  },
  isDate: { errorMessage: USERS_MESSAGE.field.dateOfBirth.invalid }
}

const userIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.field.followedUserId.require
  },
  custom: {
    options: async (value: string) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGE.notFound
        })
      }
      const user = await userServices.getUserById(value)
      if (!user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGE.notFound
        })
      }
      return true
    }
  }
}

const usernameSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: true,
  custom: {
    options: async (value: string) => {
      if (!usernameRegexr.test(value))
        throw new Error(USERS_MESSAGE.field.username.regexError)
      const user = await userServices.getUserByUserName(value)
      if (user) throw new Error(USERS_MESSAGE.field.username.isExist)
    }
  }
}

export const register = validate(
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

export const login = validate(
  checkSchema(
    {
      email: emailSchema,
      password: passwordSchema
    },
    ['body']
  )
)

export const accessToken = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: { errorMessage: USERS_MESSAGE.field.accessToken.required },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.replace('Bearer ', '')
            if (accessToken === '')
              throw new Error(USERS_MESSAGE.field.accessToken.required)
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

export const logout = validate(
  checkSchema(
    {
      refreshToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.field.refreshToken.required
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
                message: USERS_MESSAGE.field.verifyEmailToken.usedOrNotExist
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const refreshToken = validate(
  checkSchema(
    {
      refreshToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.field.refreshToken.required
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
          errorMessage: USERS_MESSAGE.field.verifyEmailToken.required
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

export const forgotPassword = validate(
  checkSchema(
    {
      email: emailSchema
    },
    ['body']
  )
)

export const verifyForgotPasswordToken = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.field.forgotPassword.require
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

export const resetPassword = validate(
  checkSchema(
    {
      forgotPasswordToken: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.field.forgotPassword.require
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
        notEmpty: { errorMessage: USERS_MESSAGE.field.accessToken.required },
        isString: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.replace('Bearer ', '')
            if (accessToken === '')
              throw new Error(USERS_MESSAGE.field.accessToken.required)
            const decodedAuthorization = await verifyToken({
              token: accessToken,
              secretOrPublicKey: JWT_ACCESS_TOKEN_SECRET
            })
            const { verify } = decodedAuthorization as AccessTokenPayload
            if (verify === UserVerifyStatus.Unverify) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.FORBIDDEN,
                message: USERS_MESSAGE.field.verify.unverified
              })
            } else if (verify === UserVerifyStatus.Banbed) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.LOCKED,
                message: USERS_MESSAGE.field.verify.locked
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
export const updateUser = validate(
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
          errorMessage: USERS_MESSAGE.field.bio.isLength
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
          errorMessage: USERS_MESSAGE.field.location.isLength
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
          errorMessage: USERS_MESSAGE.field.website.isLength
        }
      },
      username: usernameSchema,
      coverPhoto: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGE.field.coverPhoto.isLength
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
          errorMessage: USERS_MESSAGE.field.avatar.isLength
        }
      }
    },
    ['body']
  )
)

export const follower = validate(
  checkSchema(
    {
      followedUserId: userIdSchema
    },
    ['body']
  )
)

export const unfollower = validate(
  checkSchema(
    {
      followedUserId: userIdSchema
    },
    ['params']
  )
)

const userValidator = {
  accessToken,
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateUser,
  verifyEmail,
  verifyForgotPasswordToken,
  verifyUser,
  follower,
  unfollower
}

export default userValidator
