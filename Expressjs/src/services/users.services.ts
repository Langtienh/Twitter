import { TokenType, UserVerifyStatus } from '@/constants/enum'
import {
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody
} from '@/models/dto/users.request'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import User from '@/models/schemas/Users.schema'
import { hashPassword } from '@/utils/crypto'
import { signToken } from '@/utils/jwt'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import databaseServices from './database.servicers'
config()

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string
const JWT_EMAIL_VERIFY_SECRET = process.env.JWT_EMAIL_VERIFY_SECRET as string
const JWT_FORGOT_PASSWORD_TOKEN_SECRET = process.env
  .JWT_FORGOT_PASSWORD_TOKEN_SECRET as string
const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP
const EMAIL_FORGOT_PASSWORD_TOKEN_EXP =
  process.env.EMAIL_FORGOT_PASSWORD_TOKEN_EXP
const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP
const EMAIL_VERIFY_TOKEN_EXP = process.env.EMAIL_VERIFY_TOKEN_EXP

class UserServices {
  private signAccessToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.AccessToken
      },
      option: {
        expiresIn: ACCESS_TOKEN_EXP
      },
      privateKey: JWT_ACCESS_TOKEN_SECRET
    })
  }

  private signEmailVerifyToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.EmailVerifyToken
      },
      option: {
        expiresIn: EMAIL_VERIFY_TOKEN_EXP
      },
      privateKey: JWT_EMAIL_VERIFY_SECRET
    })
  }

  private signRefreshToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.RefreshToken
      },
      option: {
        expiresIn: REFRESH_TOKEN_EXP
      },
      privateKey: JWT_REFRESH_TOKEN_SECRET
    })
  }

  private signForgotPasswordToken(userId: string) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.ForgotPasswordToken
      },
      option: {
        expiresIn: EMAIL_FORGOT_PASSWORD_TOKEN_EXP
      },
      privateKey: JWT_FORGOT_PASSWORD_TOKEN_SECRET
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

  async register(registerRequestBody: RegisterRequestBody) {
    const userId = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken(userId.toString())
    // to do: send email
    const user = new User({
      ...registerRequestBody,
      _id: userId,
      emailVerifyToken,
      password: hashPassword(registerRequestBody.password),
      dateOfBirth: new Date(registerRequestBody.dateOfBirth)
    })
    await databaseServices.users.insertOne(user)
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userId.toString()
    )
    await this.insertRefreshToken(userId, refreshToken)
    return { accessToken, refreshToken }
  }

  async login(loginRequestBody: LoginRequestBody) {
    const user = await databaseServices.users.findOne(
      {
        email: loginRequestBody.email,
        password: hashPassword(loginRequestBody.password)
      },
      {
        // Loại bỏ trường các trường nhạy cảm khỏi kết quả trả về
        projection: {
          password: 0,
          emailVerifyToken: 0,
          forgotPasswordToken: 0
        }
      }
    )
    if (!user) return
    const userId = user._id.toString()
    const [accessToken, refreshToken] =
      await this.signAccessAndRefreshToken(userId)
    await this.insertRefreshToken(user._id, refreshToken)
    return { accessToken, refreshToken }
  }

  async logout(logoutRequestBody: LogoutRequestBody) {
    const refreshToken = logoutRequestBody.refreshToken
    const result = await databaseServices.refreshToken.deleteOne({
      refreshToken
    })
    return result
  }

  async verifyEmail(userId: string) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          emailVerifyToken: undefined,
          updateAt: new Date(),
          verify: UserVerifyStatus.Verifyed
        }
      }
    )
    const [accessToken, refreshToken] =
      await this.signAccessAndRefreshToken(userId)
    return { accessToken, refreshToken }
  }

  async resendVerifyEmail(userId: string) {
    const emailVerifyToken = await this.signEmailVerifyToken(userId.toString())
    // to do: send email
    await databaseServices.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          emailVerifyToken
        },
        $currentDate: {
          updateAt: true
        }
      }
    )
  }

  async forgotPassword(userId: string) {
    const forgotPasswordToken = await this.signForgotPasswordToken(userId)
    databaseServices.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgotPasswordToken
        },
        $currentDate: {
          updateAt: true
        }
      }
    )
  }

  async resetPassword(userid: ObjectId, password: string) {
    await databaseServices.users.updateOne(
      { _id: userid },
      {
        $set: {
          password: hashPassword(password),
          forgotPasswordToken: undefined
        },
        $currentDate: {
          updateAt: true
        }
      }
    )
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userid.toString()
    )
    return { accessToken, refreshToken }
  }
}
const userServices = new UserServices()
export default userServices
