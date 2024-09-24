import { ObjectId } from 'mongodb'

export default class RefreshToken {
  //  private _id: ObjectId
  refreshToken: string
  createAt: Date
  userId: ObjectId
  constructor({
    refreshToken,
    createAt,
    userId
  }: {
    refreshToken: string
    createAt?: Date
    userId: ObjectId
  }) {
    this.createAt = createAt || new Date()
    this.refreshToken = refreshToken
    this.userId = userId
  }
}
