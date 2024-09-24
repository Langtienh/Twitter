import HTTP_STATUS from '@/constants/http.status'
import { USERS_MESSAGE } from '@/constants/message'
import { AccessTokenPayload, TokenPayLoad } from '@/models/dto/payload'
import {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
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
  res.json({ message: USERS_MESSAGE.REGISTER_SUCCESS, result })
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
      message: USERS_MESSAGE.EMAIL_OR_PASSWORD_INCORRECTLY
    })
  }
  res.json({ message: USERS_MESSAGE.LOGIN_SUCCESS, result })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
) => {
  const logoutRequestBody = req.body
  await userServices.logout(logoutRequestBody)
  res.json({ message: USERS_MESSAGE.LOGOUT_SUCCESS })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenRequestBody>,
  res: Response
) => {
  const { refreshToken } = req.body
  const { userId } = req.decodedRefreshToken as TokenPayLoad
  const result = await userServices.refreshToken(userId, refreshToken)
  if (!result)
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  res.json({ message: USERS_MESSAGE.REFRESH_TOKEN_SUCCESS, result })
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
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  }
  if (!user.emailVerifyToken) {
    return res.json({ message: USERS_MESSAGE.EMAIL_VERIFiED_BEFORE })
  }
  const result = await userServices.verifyEmail(userId)
  res.json({ message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS, result })
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
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  }
  if (!user.emailVerifyToken) {
    return res.json({ message: USERS_MESSAGE.EMAIL_VERIFiED_BEFORE })
  }
  await userServices.resendVerifyEmail(userId)
  res.json({ message: USERS_MESSAGE.RESEND_EMAIL_VERIFY_SUCCESS })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { email } = req.body
  const user = await databaseServices.users.findOne({ email })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  await userServices.forgotPassword(user._id.toString())
  res.json({ message: USERS_MESSAGE.SEND_LINK_RESET_PASSWORD_SUCCESS })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  res.json({ message: USERS_MESSAGE.FORGOT_PASSWORD_EXIST })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { forgotPasswordToken, password } = req.body
  const user = await databaseServices.users.findOne({ forgotPasswordToken })
  if (!user)
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  const result = await userServices.resetPassword(
    user._id,
    password,
    user.verify,
    user.role
  )
  res.json({ message: USERS_MESSAGE.RESET_PASSWORD_SUCCESS, result })
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as AccessTokenPayload
  const user = await userServices.getUserById(userId)
  if (!user) {
    return res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND })
  }
  return res.json({
    message: USERS_MESSAGE.GET_USER_SUCCESS,
    result: cleanObject(user)
  })
}
