import { TokenPayLoad } from '@/models/dto/users.dto'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
config()

const JWT_SECRET = process.env.JWT_SECRET as string

export const signToken = ({
  payload,
  option = { algorithm: 'HS256' },
  privateKey = JWT_SECRET
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
  secretOrPublicKey = JWT_SECRET
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) {
        throw reject(err)
      }
      resolve(decoded as TokenPayLoad)
    })
  })
}
