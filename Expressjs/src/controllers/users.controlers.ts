import userServices from '@/services/users.services'
import { Request, Response } from 'express'

export const registerControler = async (req: Request, res: Response) => {
  try {
    const { name, email, password, dateOfBirth } = req.body
    const result = userServices.register({ name, email, password, dateOfBirth })
    res.json({ result, message: 'register successfully' })
  } catch (error) {
    console.log(error)
    res.json({ error: 'register failed' })
  }
}
