import HTTP_STATUS from '@/constants/http.status'
import { USERS_MASSAGE } from '@/constants/message'
import { ErrorWithMessage } from '@/models/schemas/Error'
import userServices from '@/services/users.services'
import { validate } from '@/utils/revalidator'
import { checkSchema } from 'express-validator'
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: USERS_MASSAGE.NAME_REQUIRED
      },
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 63
        },
        errorMessage: USERS_MASSAGE.NAME_LENGTH
      }
    },
    email: {
      notEmpty: {
        errorMessage: USERS_MASSAGE.EMAIL_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MASSAGE.EMAIL_INVALID
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
            throw new ErrorWithMessage({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: USERS_MASSAGE.EMAIL_ALREADY_EXISTS
            })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MASSAGE.PASSWORD_REQUIRED
      },
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 63
        },
        errorMessage: USERS_MASSAGE.PASSWORD_LENGTH
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minNumbers: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MASSAGE.PASSWORD_STRENGTH_ERROR
      }
    },
    confirmPassword: {
      isString: { errorMessage: USERS_MASSAGE.CONFIRM_PASSWORD_REQUIRED },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MASSAGE.PASSWORD_CONFIRMATION_MISMATCH)
          }
          return true
        }
      }
    },
    dateOfBirth: {
      notEmpty: {
        errorMessage: USERS_MASSAGE.DATE_OF_BIRTH_REQUIRED
      },
      isDate: { errorMessage: USERS_MASSAGE.DATE_OF_BIRTH_INVALID }
    }
  })
)
