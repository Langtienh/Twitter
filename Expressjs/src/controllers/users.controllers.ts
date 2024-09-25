import HTTP_STATUS from '@/constants/http.status'
import USERS_MESSAGE from '@/constants/message/user.message'
import { AccessTokenPayload, TokenPayLoad } from '@/models/dto/payload'
import {
  ChangePasswordReqestBody,
  FollowRepuestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  UpdateMeRepuestBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordTokenRequestBody
} from '@/models/dto/users.request'

import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import cleanObject from '@/utils/clearObject'
import { hashPassword } from '@/utils/crypto'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

export const register = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await userServices.register(req.body)
  res.json({ message: USERS_MESSAGE.api.register.success, result })
}

export const login = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
) => {
  const loginRequestBody = req.body
  const result = await userServices.login(loginRequestBody)
  if (!result) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGE.api.login.emailOrPasswordIncorrect
    })
  }
  res.json({ message: USERS_MESSAGE.api.login.success, result })
}

export const logout = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
) => {
  const logoutRequestBody = req.body
  await userServices.logout(logoutRequestBody)
  res.json({ message: USERS_MESSAGE.api.logout.success })
}

export const refreshToken = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refreshToken } = req.body
  const { userId } = req.decodedRefreshToken as TokenPayLoad
  const result = await userServices.refreshToken(userId, refreshToken)
  if (!result) return res.status(404).json({ message: USERS_MESSAGE.notFound })
  res.json({ message: USERS_MESSAGE.api.refreshToken.success, result })
}

export const verifyEmail = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { userId } = req.decodedEmailVerifyToken as TokenPayLoad
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(userId)
  })
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.notFound })
  }
  if (!user.emailVerifyToken) {
    return res.json({
      message: USERS_MESSAGE.field.verifyEmailToken.verifiedBefore
    })
  }
  const result = await userServices.verifyEmail(userId)
  res.json({ message: USERS_MESSAGE.api.emailVerify.success, result })
}

export const resendVerifyEmail = async (
  req: Request<ParamsDictionary, any>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(userId)
  })
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.notFound })
  }
  if (!user.emailVerifyToken) {
    return res.json({
      message: USERS_MESSAGE.field.verifyEmailToken.verifiedBefore
    })
  }
  await userServices.resendVerifyEmail(userId)
  res.json({ message: USERS_MESSAGE.api.resendEmailVerify.success })
}

export const forgotPassword = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { email } = req.body
  const user = await databaseServices.users.findOne({ email })
  if (!user) return res.status(404).json({ message: USERS_MESSAGE.notFound })
  await userServices.forgotPassword(user._id.toString())
  res.json({ message: USERS_MESSAGE.api.resetPassword.success })
}

export const verifyForgotPasswordToken = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user) return res.status(404).json({ message: USERS_MESSAGE.notFound })
  res.json({ message: USERS_MESSAGE.notFound })
}

export const resetPassword = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken, password } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user) return res.status(404).json({ message: USERS_MESSAGE.notFound })
  const result = await userServices.resetPassword(
    user._id,
    password,
    user.verify,
    user.role
  )
  res.json({ message: USERS_MESSAGE.api.resetPassword.success, result })
}

export const changePassword = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqestBody>,
  res: Response
) => {
  const { oldPassword, password } = req.body
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(userId)
  })
  if (!user) return res.status(404).json({ message: USERS_MESSAGE.notFound })
  if (hashPassword(oldPassword) !== user.password) {
    return res.json({ message: USERS_MESSAGE.field.oldPassword.notMathch })
  }
  await databaseServices.users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        password: hashPassword(password)
      },
      $currentDate: { updateAt: true }
    }
  )
  res.json({ message: USERS_MESSAGE.api.changePassword.success })
}

export const getMe = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await userServices.getUserById(userId)
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.notFound })
  }
  return res.json({
    message: USERS_MESSAGE.api.getUser.success,
    result: cleanObject(user)
  })
}

export const updateMe = async (
  req: Request<ParamsDictionary, any, UpdateMeRepuestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const result = await userServices.updateMe(userId, req.body)
  res.json({ message: USERS_MESSAGE.api.updateMe.success, result })
}

export const follower = async (
  req: Request<ParamsDictionary, any, FollowRepuestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const { followedUserId } = req.body
  if (userId === followedUserId)
    throw new ErrorWithStatus({
      status: HTTP_STATUS.BAD_REQUEST,
      message: USERS_MESSAGE.api.follower.cannotFollow
    })
  const result = await userServices.follower(
    new ObjectId(userId),
    new ObjectId(followedUserId)
  )
  res.json(result)
}

export const unfollower = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const { followedUserId } = req.params
  const result = await userServices.unfollower(
    new ObjectId(userId),
    new ObjectId(followedUserId)
  )
  res.json(result)
}

const userController = {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resendVerifyEmail,
  resetPassword,
  changePassword,
  getMe,
  updateMe,
  verifyEmail,
  verifyForgotPasswordToken,
  follower,
  unfollower
}

export default userController
