import { JwtPayload } from 'jsonwebtoken'

export interface TokenPayLoad extends JwtPayload {
  tokenType: TokenType
  userId: string
  exp: number
  iat: number
}

export interface AccessTokenPayload extends TokenPayLoad {
  verify: UserVerifyStatus
  role: UserRole
}
