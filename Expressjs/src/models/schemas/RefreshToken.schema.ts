import { ObjectId } from 'mongodb'

export default class RefreshToken {
  //  private _id: ObjectId
  private refreshToken: string
  private createAt: Date
  private userId: ObjectId
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
