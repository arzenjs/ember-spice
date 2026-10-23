import mongoose from "mongoose";
import User from "../models/User.js";
import { connectDB } from "./db.js";

export async function listStaffAccounts() {
  await connectDB();
  const users = await User.find().sort({ role: 1, createdAt: 1 }).lean(); // passwordHash is select:false
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastLoginAt: u.lastLoginAt ?? null,
  }));
}

// Only staff accounts can be (de)activated here: admins cannot lock each other or themselves out.
export async function setStaffStatus({ id, status }) {
  if (!mongoose.isValidObjectId(id) || !["active", "disabled"].includes(status)) return { ok: false, message: "Invalid request." };
  await connectDB();
  const user = await User.findOneAndUpdate({ _id: id, role: "staff" }, { $set: { status } }, { new: true }).lean();
  if (!user) return { ok: false, message: "Staff account not found." };
  return { ok: true, message: `${user.name} is now ${status === "active" ? "active" : "deactivated"}.` };
}
