export interface TokenPayLoad extends JwtPayload {
  userId: string
  tokenType: TokenType
}
