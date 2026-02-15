import { mongoClient } from "./mongodb";

const dbName = process.env.MONGODB_DB;
if (!dbName) {
  throw new Error("Missing MONGODB_DB in environment");
}

export async function getDb() {
  await mongoClient.connect();
  return mongoClient.db(dbName);
}
