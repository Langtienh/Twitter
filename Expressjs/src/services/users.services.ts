import { RegisterDTO } from '@/models/dto/users.dto'
import User from '@/models/schemas/Users.schema'
import databaseServices from './database.servicers'

class UserServices {
  async register(registerDTO: RegisterDTO) {
    const result = await databaseServices.users.insertOne(new User(registerDTO))
    return result
  }
}
const userServices = new UserServices()
export default userServices
