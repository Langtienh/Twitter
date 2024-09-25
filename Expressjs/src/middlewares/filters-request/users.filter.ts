import {
  RegisterRequestBody,
  UpdateMeRepuestBody
} from '@/models/dto/users.request'
import { filterMiddleware } from '../common.middleware'

export const updateMe = filterMiddleware<UpdateMeRepuestBody>([
  'name',
  'dateOfBirth',
  'bio',
  'localtion',
  'website',
  'username',
  'coverPhoto',
  'avatar'
])

export const register = filterMiddleware<RegisterRequestBody>([
  'dateOfBirth',
  'email',
  'name',
  'password'
])

const userFilter = {
  register,
  updateMe
}
export default userFilter
