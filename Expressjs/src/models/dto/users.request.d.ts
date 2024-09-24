import { TokenType } from '@/constants/enum'
import { JwtPayload } from 'jsonwebtoken'

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refreshToken: string
}

export interface TokenPayLoad extends JwtPayload {
  userId: string
  tokenType: TokenType
}

export interface VerifyEmailRequestBody {
  emailVerifyToken: string
}
