import { TokenType } from '@/constants/enum'
import { RegisterDTO } from '@/models/dto/users.dto'
import User from '@/models/schemas/Users.schema'
import { hashPassword } from '@/utils/crypto'
import { signToken } from '@/utils/jwt'
import databaseServices from './database.servicers'

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

  async register(registerDTO: RegisterDTO) {
    const result = await databaseServices.users.insertOne(
      new User({ ...registerDTO, password: hashPassword(registerDTO.password) })
    )
    const userId = result.insertedId.toString()
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(userId),
      this.signRefreshToken(userId)
    ])
    return { accessToken, refreshToken }
  }

  async checkEmailExist(email: string) {
    const user = await databaseServices.users.findOne({ email })
    return user
  }
}
const userServices = new UserServices()
export default userServices
