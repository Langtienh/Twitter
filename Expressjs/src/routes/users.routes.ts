import { registerControler } from '@/controllers/users.controlers'
import { registerValidator } from '@/middlewares/users.middleware'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post('/register', registerValidator, registerControler)

export default usersRouter
