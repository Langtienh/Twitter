import HTTP_STATUS from '@/constants/http.status'
import { USERS_MESSAGE } from '@/constants/message'
import {
  LoginRequestBody,
  LogoutRequestBody,
  RegisterRequestBody,
  TokenPayLoad,
  VerifyEmailRequestBody
} from '@/models/dto/users.request'
import { ErrorWithStatus } from '@/models/schemas/Error'
import databaseServices from '@/services/database.servicers'
import userServices from '@/services/users.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

export const registerControler = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await userServices.register(req.body)
  res.json({ message: USERS_MESSAGE.REGISTER_SUCCESS, result })
}

export const loginControler = async (
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

export const logoutControler = async (
  req: Request<ParamsDictionary, any, LogoutRequestBody>,
  res: Response
) => {
  const logoutRequestBody = req.body
  await userServices.logout(logoutRequestBody)
  res.json({ message: USERS_MESSAGE.LOGOUT_SUCCESS })
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

export const resendVerifyEmailControler = async (
  req: Request<ParamsDictionary, any>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
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
