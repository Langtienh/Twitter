import HTTP_STATUS from '@/constants/http.status'
import { USERS_MESSAGE } from '@/constants/message'
import { LoginDTO, LogoutDTO, RegisterDTO } from '@/models/dto/users.dto'
import { ErrorWithStatus } from '@/models/schemas/Error'
import userServices from '@/services/users.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const registerControler = async (
  req: Request<ParamsDictionary, any, RegisterDTO>,
  res: Response
) => {
  const result = await userServices.register(req.body)
  res.json({ message: 'Register successfully', result })
}

export const loginControler = async (
  req: Request<ParamsDictionary, any, LoginDTO>,
  res: Response
) => {
  const loginDTO = req.body
  const result = await userServices.login(loginDTO)
  if (!result) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGE.EMAIL_OR_PASSWORD_INCORRECTLY
    })
  }
  res.json({ message: 'Login successfully', result })
}

export const logoutControler = async (
  req: Request<ParamsDictionary, any, LogoutDTO>,
  res: Response
) => {
  const logoutDTO = req.body
  await userServices.logout(logoutDTO)
  res.json({ message: 'Logout successfully' })
}
