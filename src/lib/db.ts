import { mongoClient } from "./mongodb";

export async function getDb() {
  const dbName = process.env.MONGODB_DB;
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment");
  }
  if (!dbName) {
    throw new Error("Missing MONGODB_DB in environment");
  }

  await mongoClient.connect();
  return mongoClient.db(dbName);
}
