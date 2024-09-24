import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '@/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  logoutValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmail,
  verifyForgotPasswordTokenValidator
} from '@/middlewares/users.middleware'
import { wrapHandlers } from '@/utils/handlers'
import { Router } from 'express'
const usersRouter = Router()

/**
 * Description: register user
 * Path: /users/register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirmPassword: string,   dateOfBirth: string }
 */
usersRouter.post(
  '/register',
  registerValidator,
  wrapHandlers(registerController)
)
/**
 * Description: login user
 * Path: /users/login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRouter.post('/login', loginValidator, wrapHandlers(loginController))

/**
 * Description: logout user
 * Path: /users/logout
 * Method: POST
 * Header:  {Authorization: Bearer <accessToken> }
 * Body: {refreshToken: string}
 */
usersRouter.post(
  '/logout',
  accessTokenValidator,
  logoutValidator,
  wrapHandlers(logoutController)
)

/**
 * Description: verify-email
 * Path: /users/verify-email
 * Method: POST
 * Header?:  {Authorization: Bearer <accessToken> }
 * Body: {emailVerifyToken: string, otp: string}
 */
usersRouter.post(
  '/verify-email',
  verifyEmail,
  wrapHandlers(verifyEmailController)
)

/**
 * Description: resend verify email
 * Path: /users/resend-verfy-email
 * Method: POST
 * Header:  {Authorization: Bearer <accessToken> }
 * Body: {}
 */
usersRouter.post(
  '/resend-verfy-email',
  accessTokenValidator,
  wrapHandlers(resendVerifyEmailController)
)

/**
 * Description: send email forgot password
 * Path: /users/forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapHandlers(forgotPasswordController)
)

/**
 * Description: verify forgot password token isExist??
 * Path: /users/verify-forgot-password-token
 * Method: POST
 * Body: {forgotPasswordToken: string}
 */
usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapHandlers(verifyForgotPasswordTokenController)
)

/**
 * Description: reset password
 * Path: /users/reset-password
 * Method: POST
 * Body: {password: string, confirmPassword: string, forgotPasswordToken: string}
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapHandlers(resetPasswordController)
)

/**
 * Description: result user info
 * Path: /users/me
 * Method: GET
 * Header?:  {Authorization: Bearer <accessToken> }
 */
usersRouter.get('/me', accessTokenValidator, wrapHandlers(getMeController))

// usersRouter.

export default usersRouter
