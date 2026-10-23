import RateLimit from "../models/RateLimit.js";
import { connectDB } from "./db.js";

// Fixed-window limiter. Returns { allowed, retryAfterSeconds }.
// Fails closed on database errors only for callers that choose to (they receive the thrown error).
export async function rateLimit(name, subject, { limit, windowSeconds }) {
  await connectDB();
  const nowMs = Date.now();
  const windowStart = Math.floor(nowMs / (windowSeconds * 1000)) * windowSeconds * 1000;
  const expiresAt = new Date(windowStart + windowSeconds * 1000);
  const key = `${name}:${subject}:${windowStart}`;

  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true }
  );
  const allowed = doc.count <= limit;
  return { allowed, retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((expiresAt - nowMs) / 1000)) };
}
