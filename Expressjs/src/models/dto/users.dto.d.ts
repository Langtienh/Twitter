import { TokenType } from '@/constants/enum'
import { JwtPayload } from 'jsonwebtoken'

export interface RegisterDTO {
  name: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface LogoutDTO {
  refreshToken: string
}

export interface TokenPayLoad extends JwtPayload {
  userId: string
  tokenType: TokenType
}
