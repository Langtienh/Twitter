import HTTP_STATUS from '@/constants/http.status'
import { TokenPayLoad } from '@/models/dto/users.request'
import { ErrorWithStatus } from '@/models/schemas/Error'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
config()

const JWT_SECRET_DEFAULT = process.env.JWT_SECRET_DEFAULT as string

export const signToken = ({
  payload,
  option = { algorithm: 'HS256' },
  privateKey = JWT_SECRET_DEFAULT
}: {
  payload: string | Buffer | object
  option?: jwt.SignOptions
  privateKey?: string
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, option, (error, token) => {
      if (error || !token) {
        throw reject(error)
      }
      resolve(token)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey = JWT_SECRET_DEFAULT
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        throw new ErrorWithStatus({
          message: err.message,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      resolve(decoded as TokenPayLoad)
    })
  })
}
