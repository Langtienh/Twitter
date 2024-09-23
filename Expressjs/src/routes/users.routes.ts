import {
  loginControler,
  logoutControler,
  registerControler
} from '@/controllers/users.controlers'
import {
  loginValidator,
  logoutValidator,
  registerValidator
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
usersRouter.post('/logout', logoutValidator, wrapHandlers(logoutControler))

export default usersRouter
