import { TokenType, UserRole, UserVerifyStatus } from '@/constants/enum'
import USERS_MESSAGE from '@/constants/message/user.message'
import {
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  UpdateMeRepuestBody
} from '@/models/dto/users.request'
import Follower from '@/models/schemas/Follower.schema'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import User from '@/models/schemas/Users.schema'
import { hashPassword } from '@/utils/crypto'
import { signToken } from '@/utils/jwt'
import { config } from 'dotenv'
import { Document, ObjectId, WithId } from 'mongodb'
import databaseServices from './database.servicers'
config()

const projection: Document = {
  password: 0,
  emailVerifyToken: 0,
  forgotPasswordToken: 0
}

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
  private signAccessToken(
    userId: string,
    verify: UserVerifyStatus,
    role: UserRole
  ) {
    return signToken({
      payload: {
        userId,
        tokenType: TokenType.AccessToken,
        verify,
        role
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

  private signAccessAndRefreshToken(
    userId: string,
    verify: UserVerifyStatus,
    role: UserRole
  ) {
    return Promise.all([
      this.signAccessToken(userId, verify, role),
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
      userId.toString(),
      UserVerifyStatus.Unverify,
      UserRole.user
    )
    await this.insertRefreshToken(userId, refreshToken)
    return { accessToken, refreshToken }
  }

  async login(loginRequestBody: LoginRequestBody) {
    const user = await databaseServices.users.findOne({
      email: loginRequestBody.email,
      password: hashPassword(loginRequestBody.password)
    })
    if (!user) return
    const userId = user._id.toString()
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userId,
      user.verify,
      user.role
    )
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

  async refreshToken(userId: string, refreshToken: string) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(userId)
    })
    if (!user) return
    const [accessToken, newRefreshToken] = await this.signAccessAndRefreshToken(
      userId,
      user.verify,
      user.role
    )
    await databaseServices.refreshToken.deleteOne({
      refreshToken
    })
    await this.insertRefreshToken(user._id, newRefreshToken)
    return { accessToken, refreshToken: newRefreshToken }
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
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
      userId,
      UserVerifyStatus.Verifyed,
      UserRole.user
    )
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

  async resetPassword(
    userId: ObjectId,
    password: string,
    verify: UserVerifyStatus,
    role: UserRole
  ) {
    await databaseServices.users.updateOne(
      { _id: userId },
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
      userId.toString(),
      verify,
      role
    )
    return { accessToken, refreshToken }
  }

  async getUserById(userId: string) {
    const user = await databaseServices.users.findOne(
      {
        _id: new ObjectId(userId)
      },
      {
        projection
      }
    )
    return user
  }

  async updateMe(userId: string, payload: UpdateMeRepuestBody) {
    let { dateOfBirth, ..._payload } = payload
    let result: WithId<User> | null = null
    if (dateOfBirth)
      result = await databaseServices.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            ..._payload,
            dateOfBirth: new Date(dateOfBirth)
          },
          $currentDate: {
            updateAt: true
          }
        },
        {
          returnDocument: 'after',
          projection
        }
      )
    else
      result = await databaseServices.users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            ..._payload
          },
          $currentDate: {
            updateAt: true
          }
        },
        {
          returnDocument: 'after',
          projection
        }
      )
    return result
  }

  async follower(userId: ObjectId, followedUserId: ObjectId) {
    const newFollower = new Follower({
      followedUserId,
      userId
    })
    const isFollowed = await databaseServices.follower.findOne({
      userId,
      followedUserId
    })
    if (isFollowed)
      return {
        message: USERS_MESSAGE.follower.followed
      }
    await databaseServices.follower.insertOne(newFollower)
    return { message: USERS_MESSAGE.follower.success }
  }

  async unfollower(userId: ObjectId, followedUserId: ObjectId) {
    await databaseServices.follower.deleteOne({
      userId,
      followedUserId
    })
    return { message: USERS_MESSAGE.follower.unfollowSuccess }
  }
}

const userServices = new UserServices()
export default userServices
