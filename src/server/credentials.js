import User from "../models/User.js";
import { securityConfig } from "../config/security.js";
import { validateEmail } from "../lib/validation.js";
import { connectDB } from "./db.js";
import { getDummyHash, verifyPassword } from "./passwords.js";
import { rateLimit } from "./rate-limit.js";
import { getClientIp } from "./request.js";

// Used by Auth.js `authorize`. Returns the user or null; the caller never learns why it failed
// (unknown email, wrong password, disabled account and rate limiting all look identical).
export async function verifyCredentials(rawEmail, rawPassword) {
  const email = validateEmail(rawEmail).value;
  if (!email || typeof rawPassword !== "string" || !rawPassword || rawPassword.length > 200) return null;

  const { rateLimits } = securityConfig;
  const ip = await getClientIp();
  const [perAccount, perIp] = await Promise.all([
    rateLimit("login-ip-email", `${ip}:${email}`, rateLimits.loginPerIpEmail),
    rateLimit("login-ip", ip, rateLimits.loginPerIp),
  ]);
  if (!perAccount.allowed || !perIp.allowed) return null;

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash");
  const matches = await verifyPassword(rawPassword, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !matches || user.status !== "active") return null;

  await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}
