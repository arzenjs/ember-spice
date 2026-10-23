import mongoose from "mongoose";

// Fixed-window counters stored in MongoDB so limits hold across serverless instances.
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB deletes expired windows

export default mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);
