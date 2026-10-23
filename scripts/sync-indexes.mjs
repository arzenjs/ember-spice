// Creates/updates all MongoDB indexes. Run once per database (and after schema index changes):
//   npm run db:indexes
import mongoose from "mongoose";
import "../src/models/User.js";
import "../src/models/Invitation.js";
import "../src/models/Reservation.js";
import "../src/models/SlotCapacity.js";
import "../src/models/RateLimit.js";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Create .env.local first (see .env.example).");
  process.exit(1);
}
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
for (const model of Object.values(mongoose.models)) {
  await model.syncIndexes();
  console.log(`Indexes synced: ${model.modelName}`);
}
await mongoose.disconnect();
