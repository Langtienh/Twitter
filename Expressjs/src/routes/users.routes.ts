import {
  loginControler,
  logoutControler,
  registerControler,
  resendVerifyEmailControler,
  verifyEmailController
} from '@/controllers/users.controlers'
import {
  accessTokenValidator,
  loginValidator,
  logoutValidator,
  registerValidator,
  verifyEmail
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
  wrapHandlers(registerControler)
)
/**
 * Description: login user
 * Path: /users/login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRouter.post('/login', loginValidator, wrapHandlers(loginControler))

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
  wrapHandlers(logoutControler)
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
  wrapHandlers(resendVerifyEmailControler)
)

export default usersRouter
