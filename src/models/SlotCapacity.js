import mongoose from "mongoose";

// One document per (date, slot) holding the seats already promised.
// Seats are claimed with a single conditional atomic update, so concurrent bookings can never overbook.
const slotCapacitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  slot: { type: Number, required: true }, // minutes since midnight
  seatsBooked: { type: Number, required: true, min: 0, default: 0 },
});

slotCapacitySchema.index({ date: 1, slot: 1 }, { unique: true });

export default mongoose.models.SlotCapacity || mongoose.model("SlotCapacity", slotCapacitySchema);
