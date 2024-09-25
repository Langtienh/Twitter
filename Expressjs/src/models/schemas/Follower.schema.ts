import { ObjectId } from 'mongodb'

interface IFollower {
  userId: ObjectId
  followedUserId: ObjectId
}

export default class Follower {
  _id?: ObjectId
  userId: ObjectId
  followedUserId: ObjectId
  createAt: Date
  constructor({ followedUserId, userId }: IFollower) {
    this.userId = userId
    this.followedUserId = followedUserId
    this.createAt = new Date()
  }
}
