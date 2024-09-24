import HTTP_STATUS from '@/constants/http.status'
import USERS_MESSAGE from '@/constants/message/user.message'
import { AccessTokenPayload, TokenPayLoad } from '@/models/dto/payload'
import {
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
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await userServices.register(req.body)
  res.json({ message: USERS_MESSAGE.success.register, result })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
) => {
  const loginRequestBody = req.body
  const result = await userServices.login(loginRequestBody)
  if (!result) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGE.token.emailOrPasswordIncorrect
    })
  }
  res.json({ message: USERS_MESSAGE.success.login, result })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
) => {
  const logoutRequestBody = req.body
  await userServices.logout(logoutRequestBody)
  res.json({ message: USERS_MESSAGE.success.logout })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refreshToken } = req.body
  const { userId } = req.decodedRefreshToken as TokenPayLoad
  const result = await userServices.refreshToken(userId, refreshToken)
  if (!result)
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  res.json({ message: USERS_MESSAGE.success.refreshToken, result })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { userId } = req.decodedEmailVerifyToken as TokenPayLoad
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(userId)
  })
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  }
  if (!user.emailVerifyToken) {
    return res.json({
      message: USERS_MESSAGE.token.verifyEmailToken.verifiedBefore
    })
  }
  const result = await userServices.verifyEmail(userId)
  res.json({ message: USERS_MESSAGE.success.emailVerify, result })
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await databaseServices.users.findOne({
    _id: new ObjectId(userId)
  })
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  }
  if (!user.emailVerifyToken) {
    return res.json({
      message: USERS_MESSAGE.token.verifyEmailToken.verifiedBefore
    })
  }
  await userServices.resendVerifyEmail(userId)
  res.json({ message: USERS_MESSAGE.success.resendEmailVerify })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { email } = req.body
  const user = await databaseServices.users.findOne({ email })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  await userServices.forgotPassword(user._id.toString())
  res.json({ message: USERS_MESSAGE.success.resetPassword })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  res.json({ message: USERS_MESSAGE.passwordReset.forgotPasswordExist })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken, password } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  const result = await userServices.resetPassword(
    user._id,
    password,
    user.verify,
    user.role
  )
  res.json({ message: USERS_MESSAGE.success.resetPassword, result })
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await userServices.getUserById(userId)
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.account.notFound })
  }
  return res.json({
    message: USERS_MESSAGE.success.getUser,
    result: cleanObject(user)
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeRepuestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const result = await userServices.updateMe(userId, req.body)
  res.json({ message: USERS_MESSAGE.success.updateMe, result })
}
