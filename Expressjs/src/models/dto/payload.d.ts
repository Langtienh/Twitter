export interface TokenPayLoad extends JwtPayload {
  tokenType: TokenType
  userId: string
}

export interface AccessTokenPayload extends TokenPayLoad {
  verify: UserVerifyStatus
  role: UserRole
}
