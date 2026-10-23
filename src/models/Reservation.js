import mongoose from "mongoose";
import { STATUSES } from "../lib/status.js";

const reservationSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true }, // e.g. ES-7K3M-9QX2
    // SHA-256 of the confirmation-page token. The token itself is never stored.
    tokenHash: { type: String, required: true, unique: true },

    guestName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    phoneDigits: { type: String, required: true }, // digits only, for phone search

    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // restaurant-local
    time: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    startMinutes: { type: Number, required: true, min: 0, max: 1439 },
    partySize: { type: Number, required: true, min: 1, max: 100 },

    status: { type: String, enum: STATUSES, default: "confirmed", required: true },
    table: { type: String, trim: true, maxlength: 20, default: "" },
    // True while this booking's seats are counted in SlotCapacity. Makes releasing idempotent.
    seatsHeld: { type: Boolean, default: true },

    emailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    emailAttempts: { type: Number, default: 0 },
    lastEmailAttemptAt: Date,

    arrivedAt: Date,
    seatedAt: Date,
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

reservationSchema.index({ date: 1, startMinutes: 1 }); // day view and time filter
reservationSchema.index({ status: 1, date: 1 });
reservationSchema.index({ email: 1, date: 1 }); // duplicate and per-email limit checks
reservationSchema.index({ phoneDigits: 1 });

export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
