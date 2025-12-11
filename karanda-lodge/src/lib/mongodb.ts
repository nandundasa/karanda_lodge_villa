import { MongoClient, Db } from "mongodb";

let cached: { conn: MongoClient | null; db: Db | null } = {
  conn: null,
  db: null,
};

export async function connectToDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Return cached connection if available
  if (cached.conn && cached.db) {
    return cached.db;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("KarandaLodge");

    cached.conn = client;
    cached.db = db;

    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
