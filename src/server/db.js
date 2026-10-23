import mongoose from "mongoose";
// Importing the models registers them so their indexes are created on first connection.
import "../models/User.js";
import "../models/Invitation.js";
import "../models/Reservation.js";
import "../models/SlotCapacity.js";
import "../models/RateLimit.js";

// Cache the connection on globalThis so dev hot-reloads and serverless warm starts reuse it.
const cache = (globalThis.__emberMongoose ??= { connection: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  if (cache.connection) return cache.connection;

  cache.promise ??= mongoose
    .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
    .then(async (m) => {
      // Make sure unique indexes exist before serving traffic (they back the safety guarantees).
      await Promise.all(Object.values(m.models).map((model) => model.init()));
      return m;
    })
    .catch((err) => {
      cache.promise = null; // allow a retry on the next request
      throw err;
    });

  cache.connection = await cache.promise;
  return cache.connection;
}
