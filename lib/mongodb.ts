import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || ""
let clientPromise: Promise<MongoClient | null>

if (!uri) {
  console.warn("MONGODB_URI not set in env. Database calls will fail.")
  // Avoid creating a MongoClient with an empty string (causes MongoParseError).
  clientPromise = Promise.resolve(null)
} else {
  if (process.env.NODE_ENV === "development") {
    // In dev, use a global to preserve cache between hot reloads
    ;(global as any)._mongoClientPromise ||= new MongoClient(uri).connect()
    clientPromise = (global as any)._mongoClientPromise
  } else {
    clientPromise = new MongoClient(uri).connect()
  }
}

export default clientPromise
