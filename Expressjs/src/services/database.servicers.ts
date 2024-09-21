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
      console.log(`Connected to mongoDB successfully!. DbName: ${dbName}`)
    } catch {
      console.log('Connected failed')
      await this.client.close()
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }
}
const databaseServices = new DatabaseServices()
export default databaseServices