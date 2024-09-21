import { registerControler } from '@/controllers/users.controlers'
import { Router } from 'express'
const usersRouter = Router()

usersRouter.post('/register', registerControler)

export default usersRouter
