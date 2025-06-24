import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let connectionPromise: Promise<MongoClient> | null = null

async function createMongoConnection(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  console.log("Creating MongoDB connection...")

  const client = new MongoClient(uri, {
    // Production-optimized settings
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    maxIdleTimeMS: 60000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    w: "majority",
    readPreference: "primary",
    compressors: ["snappy", "zlib"],
    tls: true,
  })

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    // Verify connection
    await client.db("admin").command({ ping: 1 })
    console.log("✅ MongoDB ping successful")

    return client
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    await client.close().catch(() => {})
    throw new Error(`Database connection failed: ${error.message}`)
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  // Use cached client if available and healthy
  if (cachedClient) {
    try {
      await cachedClient.db("admin").command({ ping: 1 })
      return cachedClient
    } catch (error) {
      console.log("Cached connection is stale, creating new one")
      cachedClient = null
      connectionPromise = null
    }
  }

  // Use existing connection promise if in progress
  if (connectionPromise) {
    return connectionPromise
  }

  // Create new connection
  connectionPromise = createMongoConnection()

  try {
    cachedClient = await connectionPromise
    return cachedClient
  } catch (error) {
    connectionPromise = null
    throw error
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient()
  return client.db("trckr")
}

// Helper function for database operations with timeout
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs = 5000,
  operationName = "Database operation",
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs),
    ),
  ])
}
