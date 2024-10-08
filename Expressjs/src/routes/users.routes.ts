import userController from '@/controllers/users.controllers'
import userFilter from '@/middlewares/filters-request/users.filter'
import userValidator from '@/middlewares/users.middleware'
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
  userValidator.register,
  userFilter.register,
  wrapHandlers(userController.register)
)
/**
 * Description: login user
 * Path: /users/login
 * Method: POST
 * Body: {email: string, password: string}
 */
usersRouter.post(
  '/login',
  userValidator.login,
  wrapHandlers(userController.login)
)

/**
 * Description: logout user
 * Path: /users/logout
 * Method: POST
 * Header:  {Authorization: Bearer <accessToken> }
 * Body: {refreshToken: string}
 */
usersRouter.post(
  '/logout',
  userValidator.accessToken,
  userValidator.logout,
  wrapHandlers(userController.logout)
)
/**
 * Description: refresh token
 * Path: /users/refresh-token
 * Method: POST
 * Body: {refreshToken: string}
 */
usersRouter.post(
  '/refresh-token',
  userValidator.refreshToken,
  wrapHandlers(userController.refreshToken)
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
  userValidator.verifyEmail,
  wrapHandlers(userController.verifyEmail)
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
  userValidator.accessToken,
  wrapHandlers(userController.resendVerifyEmail)
)

/**
 * Description: send email forgot password
 * Path: /users/forgot-password
 * Method: POST
 * Body: {email: string}
 */
usersRouter.post(
  '/forgot-password',
  userValidator.forgotPassword,
  wrapHandlers(userController.forgotPassword)
)

/**
 * Description: verify forgot password token isExist??
 * Path: /users/verify-forgot-password-token
 * Method: POST
 * Body: {forgotPasswordToken: string}
 */
usersRouter.post(
  '/verify-forgot-password-token',
  userValidator.verifyForgotPasswordToken,
  wrapHandlers(userController.verifyForgotPasswordToken)
)

/**
 * Description: reset password
 * Path: /users/reset-password
 * Method: POST
 * Body: {password: string, confirmPassword: string, forgotPasswordToken: string}
 */
usersRouter.post(
  '/reset-password',
  userValidator.resetPassword,
  wrapHandlers(userController.resetPassword)
)

/**
 * Description: change password
 * Path: /users/change-password
 * Method: POST
 * Header?:  {Authorization: Bearer <accessToken> }
 * Body: {password: string, confirmPassword: string, oldPassword: string}
 */
usersRouter.post(
  '/change-password',
  userValidator.accessToken,
  userValidator.changePassword,
  wrapHandlers(userController.changePassword)
)

/**
 * Description: result user info
 * Path: /users/me
 * Method: GET
 * Header?:  {Authorization: Bearer <accessToken> }
 */
usersRouter.get(
  '/me',
  userValidator.accessToken,
  wrapHandlers(userController.getMe)
)

/**
 * Description: result user info
 * Path: /users/me
 * Method: PUT
 * Header?:  {Authorization: Bearer <accessToken> }
 * Body: UserSchema
 */
usersRouter.put(
  '/me',
  userValidator.verifyUser,
  userValidator.updateUser,
  userFilter.updateMe,
  wrapHandlers(userController.updateMe)
)

/**
 * Description: create follower
 * Path: /users/follow
 * Method: POST
 * Header?:  {Authorization: Bearer <accessToken> }
 * Body: {followedUserId: string}
 */
usersRouter.post(
  '/follow',
  userValidator.verifyUser,
  userValidator.follower,
  wrapHandlers(userController.follower)
)

/**
 * Description: delete follower
 * Path: /users/follow/:user-id:
 * Method: DELETE
 * Header?:  {Authorization: Bearer <accessToken> }
 */
usersRouter.delete(
  '/follow/:followedUserId',
  userValidator.verifyUser,
  userValidator.unfollower,
  wrapHandlers(userController.unfollower)
)

/**
 * Description: oauth with google
 * Path: /users/follow/:user-id:
 * Method: GET
 * query: {code}
 */
usersRouter.get('/oauth/google', wrapHandlers(userController.oauth))

export default usersRouter
