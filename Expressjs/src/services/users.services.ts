import { TokenType } from '@/constants/enum'
import { LoginDTO, LogoutDTO, RegisterDTO } from '@/models/dto/users.dto'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import User from '@/models/schemas/Users.schema'
import { hashPassword } from '@/utils/crypto'
import { signToken } from '@/utils/jwt'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import databaseServices from './database.servicers'
config()

class UserServices {
  private signAccessToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.AccessToken
      },
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXP
      }
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.RefreshToken
      },
      option: {
        expiresIn: process.env.REFRESH_TOKEN_EXP
      }
    })
  }

  private signAccessAndRefreshToken(userId: string) {
    return Promise.all([
      this.signAccessToken(userId),
      this.signRefreshToken(userId)
    ])
  }

  async checkEmailExist(email: string) {
    const user = await databaseServices.users.findOne({ email })
    return user
  }

  private async insertRefreshToken(
    userId: ObjectId,
    refreshToken: string,
    createAt?: Date
  ) {
    databaseServices.refreshToken.insertOne(
      new RefreshToken({ userId, refreshToken, createAt })
    )
  }

  async register(registerDTO: RegisterDTO) {
    const result = await databaseServices.users.insertOne(
      new User({ ...registerDTO, password: hashPassword(registerDTO.password) })
    )
    const userId = result.insertedId.toString()
    const [accessToken, refreshToken] =
      await this.signAccessAndRefreshToken(userId)
    await this.insertRefreshToken(result.insertedId, refreshToken)
    return { accessToken, refreshToken }
  }

  async login(loginDTO: LoginDTO) {
    const user = await databaseServices.users.findOne({
      email: loginDTO.email,
      password: hashPassword(loginDTO.password)
    })
    if (!user) return
    const userId = user._id.toString()
    const [accessToken, refreshToken] =
      await this.signAccessAndRefreshToken(userId)
    await this.insertRefreshToken(user._id, refreshToken)
    return { accessToken, refreshToken, user }
  }

  async logout(logoutDTO: LogoutDTO) {
    const refreshToken = logoutDTO.refreshToken
    const result = await databaseServices.refreshToken.deleteOne({
      refreshToken
    })
    return result
  }
}
const userServices = new UserServices()
export default userServices
