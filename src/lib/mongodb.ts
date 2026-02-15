import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

// Avoid throwing during build-time module evaluation; runtime handlers validate env.
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/__missing_mongodb_uri__";

export const mongoClient =
  globalForMongo.mongoClient ?? new MongoClient(mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient;
}
