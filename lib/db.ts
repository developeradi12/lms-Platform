import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env.local")
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export default async function connectDb() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "lms",
        bufferCommands:false
      })
      .then((mongoose) => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}

/*With bufferCommands: false:

👉 Fail FAST.
👉 No hanging queries.

Senior engineers ALWAYS disable buffering.*/