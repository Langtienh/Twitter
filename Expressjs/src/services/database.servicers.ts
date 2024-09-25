import Follower from '@/models/schemas/Follower.schema'
import RefreshToken from '@/models/schemas/RefreshToken.schema'
import User from '@/models/schemas/Users.schema'
import { config } from 'dotenv'

import { Collection, Db, MongoClient } from 'mongodb'

config()
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const cluster = process.env.DB_CLUSTER
const retryWrites = process.env.DB_RETRY_WRITES
const w = process.env.DB_W
const appName = process.env.DB_APP_Name
const dbName = process.env.DB_NAME

let uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=${retryWrites}&w=${w}&appName=${appName}`

class DatabaseServices {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(dbName)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log(`Connected to mongoDB with db: ${dbName} successfully!`)
    } catch {
      console.log('Connected failed')
      await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection('refreshToken')
  }

  get follower(): Collection<Follower> {
    return this.db.collection('follower')
  }
}
const databaseServices = new DatabaseServices()
export default databaseServices
