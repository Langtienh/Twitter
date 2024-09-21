import userServices from '@/services/users.services'
import { validate } from '@/utils/revalidator'
import { checkSchema } from 'express-validator'
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isString: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 63
        }
      }
    },
    email: {
      notEmpty: true,
      isEmail: true,
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
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 63
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minNumbers: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage:
          'The password must be at least 6 characters long, including at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.'
      }
    },
    confirmPassword: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
          }
          return true
        }
      }
    },
    dateOfBirth: {
      isDate: true
    }
  })
)
