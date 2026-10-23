import mongoose from "mongoose";

// Status "expired" is not stored: a pending invitation past expiresAt is treated as expired.
const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    role: { type: String, enum: ["staff"], default: "staff", required: true },
    tokenHash: { type: String, required: true, unique: true }, // SHA-256 of the emailed token
    status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending", required: true },
    expiresAt: { type: Date, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sendCount: { type: Number, default: 0 },
    emailStatus: { type: String, enum: ["sent", "failed"], default: "failed" },
    acceptedAt: Date,
    revokedAt: Date,
  },
  { timestamps: true }
);

// At most one pending invitation per email address.
invitationSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export default mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
