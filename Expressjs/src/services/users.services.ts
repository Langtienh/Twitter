import { TokenType, UserRole, UserVerifyStatus } from '@/constants/enum'
import HTTP_STATUS from '@/constants/http.status'
import USERS_MESSAGE from '@/constants/message/user.message'
import {
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  UpdateMeRepuestBody
} from '@/models/dto/users.request'
import { ErrorWithStatus } from '@/models/schemas/Error'
import Follower from '@/models/schemas/Follower.schema'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import User from '@/models/schemas/Users.schema'
import { GoogleUserInfo } from '@/type'
import { hashPassword } from '@/utils/crypto'
import { signToken } from '@/utils/jwt'
import axios from 'axios'
import { config } from 'dotenv'
import { Document, ObjectId } from 'mongodb'
import databaseServices from './database.servicers'
config()

const userProjection: Document = {
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

  private async signRefreshToken(userId: string) {
    const refreshToken = await signToken({
      payload: {
        userId,
        tokenType: TokenType.RefreshToken
      },
      option: {
        expiresIn: REFRESH_TOKEN_EXP
      },
      privateKey: JWT_REFRESH_TOKEN_SECRET
    })
    await this.insertRefreshToken(new ObjectId(userId), refreshToken)
    return refreshToken
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
    return { accessToken, refreshToken }
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return data
  }

  private async getUserGoogleInfo(access_token: string, id_token: string) {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
    return data as GoogleUserInfo
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const { email, email_verified, name, picture } =
      await this.getUserGoogleInfo(access_token, id_token)
    if (!email_verified) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: USERS_MESSAGE.field.verify.unverified
      })
    }
    const user = await this.getUser({ email })
    if (user) {
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
        user._id.toString(),
        user.verify,
        user.role
      )
      return { accessToken, refreshToken, new: false }
    } else {
      const newUser = new User({
        name,
        email,
        password: hashPassword(email),
        avatar: picture
      })
      const result = await databaseServices.users.insertOne(newUser)
      const [accessToken, refreshToken] = await this.signAccessAndRefreshToken(
        result.insertedId.toString(),
        UserVerifyStatus.Unverify,
        UserRole.user
      )
      return { accessToken, refreshToken, new: true }
    }
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
  getUser({
    email,
    _id,
    username
  }: {
    email?: string
    username?: string
    _id?: ObjectId
  }) {
    let data = {}
    if (email) data = { email }
    if (username) data = { ...data, username }
    if (_id) data = { ...data, _id }
    return databaseServices.users.findOne(data, {
      projection: userProjection
    })
  }
  getUserById(userId: string) {
    return this.getUser({ _id: new ObjectId(userId) })
  }

  getUserByEmail(email: string) {
    return this.getUser({ email })
  }

  getUserByUserName(username: string) {
    return this.getUser({ username })
  }

  async updateMe(userId: string, updateMeRepuestBody: UpdateMeRepuestBody) {
    const { dateOfBirth, ...payload } = updateMeRepuestBody
    const data = {
      ...payload,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
    }
    const result = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: data,
        $currentDate: {
          updateAt: true
        }
      },
      {
        returnDocument: 'after',
        projection: userProjection
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
        message: USERS_MESSAGE.api.follower.followed
      }
    await databaseServices.follower.insertOne(newFollower)
    return { message: USERS_MESSAGE.api.follower.success }
  }

  async unfollower(userId: ObjectId, followedUserId: ObjectId) {
    await databaseServices.follower.deleteOne({
      userId,
      followedUserId
    })
    return { message: USERS_MESSAGE.api.follower.unfollowSuccess }
  }
}

const userServices = new UserServices()
export default userServices
