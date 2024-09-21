import { UserRole, UserVerifyStatus } from '@/constants/enum'
import { RegisterDTO } from '../dto/users.dto'

export default class User {
  // private _id?: ObjectId
  private name: string
  private email: string
  private password: string
  private dateOfBirth: Date
  private createAt: Date
  private updateAt: Date
  private verify: UserVerifyStatus
  private role: UserRole
  private deleted: boolean
  // oftion
  private username?: string
  private bio?: string
  private localtion?: string
  private website?: string
  private avatar?: string
  private coverPhoto?: string
  private emailVerifyToken?: string
  private forgotPasswordToken?: string

  constructor(registerDTO: RegisterDTO) {
    const now = new Date()
    this.name = registerDTO.name
    this.email = registerDTO.email
    this.password = registerDTO.password
    this.dateOfBirth = new Date(registerDTO.dateOfBirth)
    this.verify = UserVerifyStatus.Unverify
    this.role = UserRole.user
    this.createAt = now
    this.updateAt = now
    this.deleted = false
  }
}
