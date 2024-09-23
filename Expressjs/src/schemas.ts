import { ObjectId } from 'mongodb'
import {
  MediaType,
  TweetAudiece,
  TweetType,
  UserRole,
  UserVerifyStatus
} from './constants/enum'

interface IUser {
  _id: ObjectId
  name: string
  email: string
  password: string
  dateOfBirth: Date
  createAt: Date
  updateAt: Date
  verify: UserVerifyStatus
  role: UserRole
  deleted: boolean
  // oftion
  username?: string
  bio?: string
  localtion?: string
  website?: string
  avatar?: string
  coverPhoto?: string
  emailVerifyToken?: string
  forgotPasswordToken?: string
}

interface IRefreshToken {
  _id: ObjectId
  refreshToken: string
  createAt: Date
  userId: ObjectId
}

interface IFollower {
  _id: ObjectId
  userId: ObjectId
  followedUserId: ObjectId
  createAt: Date
}

interface IMedia {
  url: string
  type: MediaType
}

interface ITweet {
  _id: ObjectId
  userId: ObjectId
  type: TweetType
  audiece: TweetAudiece
  content: string
  parentId: ObjectId | null
  hashtags: string[]
  mentions: string[]
  medias: IMedia[]
  guestViews: number
  userViews: number
  createAt: Date
  updateAt: Date
}

interface IBookmark {
  _id: ObjectId
  userId: ObjectId
  tweetId: ObjectId
  createAt: Date
}

interface ILike {
  _id: ObjectId
  userId: ObjectId
  string: string
  tweetId: ObjectId
  createAt: Date
}

interface IHashtag {
  _id: ObjectId
  name: string
  createAt: Date
}
