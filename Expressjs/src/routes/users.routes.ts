import { registerControler } from '@/controllers/users.controlers'
import { registerValidator } from '@/middlewares/users.middleware'
import { wrapHandlers } from '@/utils/handlers'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post(
  '/register',
  registerValidator,
  wrapHandlers(registerControler)
)

export default usersRouter
