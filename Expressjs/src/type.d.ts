import { TokenPayLoad } from '@/models/dto/payload'
import 'express'
import User from './models/schemas/Users.schema'

declare module 'express' {
  interface Request {
    user?: User
    decodedAuthorization?: AccessTokenPayload
    decodedRefreshToken?: TokenPayLoad
    decodedEmailVerifyToken?: TokenPayLoad
    decodeForgotPasswordToken?: TokenPayLoad
  }
}
