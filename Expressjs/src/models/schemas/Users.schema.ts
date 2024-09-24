import { UserRole, UserVerifyStatus } from '@/constants/enum'
import { ObjectId } from 'mongodb'

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  createAt: Date
  updateAt: Date
  verify: UserVerifyStatus
  role: UserRole
  deleted: boolean
  // oftion
  dateOfBirth?: Date
  username?: string
  bio?: string
  localtion?: string
  website?: string
  avatar?: string
  coverPhoto?: string
  emailVerifyToken?: string
  forgotPasswordToken?: string

  constructor(registerRequestBody: UserConstructor) {
    const now = new Date()
    this._id = registerRequestBody._id
    this.name = registerRequestBody.name
    this.email = registerRequestBody.email
    this.password = registerRequestBody.password
    this.dateOfBirth = registerRequestBody.dateOfBirth
    this.verify = UserVerifyStatus.Unverify
    this.role = UserRole.user
    this.createAt = now
    this.updateAt = now
    this.deleted = false
    this.emailVerifyToken = registerRequestBody.emailVerifyToken
  }
}

interface UserConstructor {
  _id?: ObjectId
  name: string
  email: string
  password: string
  // oftion
  dateOfBirth?: Date
  username?: string
  bio?: string
  localtion?: string
  website?: string
  avatar?: string
  coverPhoto?: string
  emailVerifyToken?: string
  forgotPasswordToken?: string
}
