import jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  option = { algorithm: 'HS256' },
  privateKey = process.env.PASSWORD_SECRET as string
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
