import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import User from "@/models/User";
import { homePathForRole } from "@/lib/safe-redirect";
import { connectDB } from "./db.js";

// The authoritative "who is this?" check. The session only carries a user id: role and status come
// from the database on every call, so the browser can never assert a role and disabled users are cut off at once.
export async function getCurrentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id || !mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user || user.status !== "active") return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

// Call at the top of every protected page, server action and route handler.
export async function requireUser(roles = ["staff", "admin"]) {
  const user = await getCurrentUser();
  if (!user) redirect("/staff/login");
  if (!roles.includes(user.role)) redirect(homePathForRole(user.role));
  return user;
}
