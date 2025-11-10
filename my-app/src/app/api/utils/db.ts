import mongoose from 'mongoose'
let cached = (global as any).mongoose || { conn: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URL) {
    throw new Error("❌ MONGODB_URI missing in .env");
  }

  cached.conn = await mongoose.connect(process.env.MONGO_URL);


  
  (global as any).mongoose = cached;
  return cached.conn;
}



