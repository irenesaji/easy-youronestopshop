import { MongoClient, Db } from "mongodb"
import bcrypt from "bcryptjs"

// default to local MongoDB for development when not set
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/"
const dbName = process.env.MONGODB_DB || "majorproject"

if (!uri) {
  console.warn("MONGODB_URI is not set. Database calls will fail until it is configured.")
}

declare global {
  // allow global to cache the client across module reloads in dev
  // @ts-ignore
  var _mongoClient: { client: MongoClient | null; promise: Promise<MongoClient> | null } | undefined
  // cache an in-memory mock DB for dev
  var _mockDb: any
}

let cached: { client: MongoClient | null; promise: Promise<MongoClient> | null } = global._mongoClient || { client: null, promise: null }

function createMockDb() {
  // seed a single dev user from env or defaults
  const devEmail = (process.env.DEV_MOCK_USER_EMAIL || "dev@local").toLowerCase()
  const devPasswordPlain = process.env.DEV_MOCK_USER_PASSWORD || "password"
  const hashed = bcrypt.hashSync(devPasswordPlain, 10)

  const users: any[] = [
    { _id: "dev-user", email: devEmail, password: hashed, name: "Dev User" },
  ]

  return {
    collection(name: string) {
      if (name !== "users") {
        return {
          findOne: async () => null,
          updateOne: async () => ({ modifiedCount: 0 }),
        }
      }

      return {
        findOne: async (query: any) => {
          const email = String(query?.email || "").toLowerCase()
          return users.find((u) => u.email === email) || null
        },
        insertOne: async (doc: any) => {
          const id = `mock-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
          users.push({ _id: id, ...doc })
          return { insertedId: id }
        },
        updateOne: async (filter: any, update: any) => {
          const id = filter?._id
          const user = users.find((u) => u._id === id)
          if (!user) return { modifiedCount: 0 }
          if (update?.$set?.password) user.password = update.$set.password
          return { modifiedCount: 1 }
        },
      }
    },
  }
}

export async function connectToDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment")
  }

  if (!cached.client) {
    if (!cached.promise) {
      const client = new MongoClient(uri)
      cached.promise = client.connect().then(() => {
        cached.client = client
        return client
      })
    }

    try {
      await cached.promise
    } catch (err) {
      console.error("connectToDatabase: failed to connect to MongoDB:", err)
      // Fallback to an in-memory mock DB so routes can still function during local development
      if (!global._mockDb) global._mockDb = createMockDb()
      return global._mockDb
    }
  }

  if (!cached.client) throw new Error("Failed to establish MongoDB client")

  global._mongoClient = cached

  return cached.client.db(dbName)
}

export default connectToDatabase
