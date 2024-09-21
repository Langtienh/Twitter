import { RegisterDTO } from '@/models/dto/users.dto'
import userServices from '@/services/users.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const registerControler = async (
  req: Request<ParamsDictionary, any, RegisterDTO>,
  res: Response
) => {
  try {
    const result = await userServices.register(req.body)
    res.json({ result, message: 'register successfully' })
  } catch {
    res.json({ error: 'register failed' })
  }
}
