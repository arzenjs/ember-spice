import mongoose from "mongoose";
import Invitation from "../models/Invitation.js";
import User from "../models/User.js";
import { restaurant } from "../config/restaurant.js";
import { securityConfig } from "../config/security.js";
import { getSiteUrl } from "../config/site.js";
import { buildStaffInvitationEmail } from "../emails/staff-invitation.js";
import { generateToken, hashToken, looksLikeToken } from "../lib/tokens.js";
import { validateEmail, validateName, validatePassword } from "../lib/validation.js";
import { connectDB } from "./db.js";
import { sendEmail } from "./email.js";
import { hashPassword } from "./passwords.js";

const expiryDate = () => new Date(Date.now() + securityConfig.invitationValidHours * 3600 * 1000);
export const acceptUrl = (token) => `${getSiteUrl()}/staff/accept-invitation?token=${token}`;

async function deliverInvitation(invitation, token, invitedByName) {
  const email = buildStaffInvitationEmail({
    acceptUrl: acceptUrl(token),
    invitedByName,
    expiresInHours: securityConfig.invitationValidHours,
    restaurant,
  });
  const result = await sendEmail({ to: invitation.email, ...email });
  if (!result.ok) console.error(`[email] Invitation for ${invitation.email} not sent: ${result.error}`);
  await Invitation.updateOne(
    { _id: invitation._id },
    { $set: { emailStatus: result.ok ? "sent" : "failed" }, $inc: { sendCount: 1 } }
  );
  return result.ok;
}

// Admin invites a new staff member. The account is NOT created here, only on acceptance.
// Re-inviting an email with a pending invitation replaces that invitation (new token, new expiry).
export async function inviteStaff({ email: rawEmail, admin }) {
  const email = validateEmail(rawEmail);
  if (email.error) return { ok: false, message: email.error };
  await connectDB();

  const existing = await User.findOne({ email: email.value }).select("role status").lean();
  if (existing?.role === "admin") return { ok: false, message: "That email belongs to an administrator." };
  if (existing?.status === "active") return { ok: false, message: "That person already has an active staff account." };
  // A disabled staff account is allowed: accepting the invitation re-activates it without creating a duplicate user.

  const token = generateToken();
  const fields = { tokenHash: hashToken(token), expiresAt: expiryDate(), invitedBy: admin.id, role: "staff" };
  let invitation;
  for (let attempt = 0; attempt < 2 && !invitation; attempt++) {
    try {
      invitation = await Invitation.findOneAndUpdate(
        { email: email.value, status: "pending" },
        { $set: fields },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (err?.code !== 11000 || attempt === 1) throw err; // concurrent invite for the same email: retry once
    }
  }

  const sent = await deliverInvitation(invitation, token, admin.name);
  return sent
    ? { ok: true, message: `Invitation sent to ${email.value}.` }
    : { ok: true, warning: true, message: `Invitation saved, but the email could not be sent. Use “Resend” once email is configured.` };
}

export async function resendInvitation({ id, admin }) {
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Invitation not found." };
  await connectDB();
  const token = generateToken();
  // Rotating the token invalidates the previously emailed link. Expired-but-pending invitations are revived here.
  const invitation = await Invitation.findOneAndUpdate(
    { _id: id, status: "pending" },
    { $set: { tokenHash: hashToken(token), expiresAt: expiryDate(), invitedBy: admin.id } },
    { new: true }
  );
  if (!invitation) return { ok: false, message: "Only pending invitations can be resent. Use “Invite staff” to start a new one." };
  const sent = await deliverInvitation(invitation, token, admin.name);
  return sent ? { ok: true, message: `Invitation resent to ${invitation.email}.` } : { ok: false, message: "The email could not be sent. Check the email configuration." };
}

export async function revokeInvitation({ id }) {
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Invitation not found." };
  await connectDB();
  const revoked = await Invitation.findOneAndUpdate({ _id: id, status: "pending" }, { $set: { status: "revoked", revokedAt: new Date() } });
  return revoked ? { ok: true, message: "Invitation revoked." } : { ok: false, message: "Only pending invitations can be revoked." };
}

export async function listInvitations() {
  await connectDB();
  const now = Date.now();
  const rows = await Invitation.find().sort({ createdAt: -1 }).limit(50).populate("invitedBy", "name").lean();
  return rows.map((i) => ({
    id: String(i._id),
    email: i.email,
    status: i.status === "pending" && i.expiresAt.getTime() <= now ? "expired" : i.status,
    expiresAt: i.expiresAt,
    invitedBy: i.invitedBy?.name ?? "Unknown",
    emailStatus: i.emailStatus,
  }));
}

// Read-only check used to render the accept page. Does not consume the invitation.
// Only a still-valid invitation reveals its email address.
export async function inspectInvitation(token) {
  if (!looksLikeToken(token)) return { state: "invalid" };
  await connectDB();
  const invitation = await Invitation.findOne({ tokenHash: hashToken(token) }).lean();
  if (!invitation) return { state: "invalid" };
  if (invitation.status === "accepted") return { state: "used" };
  if (invitation.status === "revoked") return { state: "revoked" };
  if (invitation.expiresAt.getTime() <= Date.now()) return { state: "expired" };
  return { state: "valid", email: invitation.email };
}

// Single-use acceptance. The atomic "claim" below is what makes replays and races impossible:
// only one request can flip the invitation from pending to accepted.
export async function acceptInvitation({ token, name: rawName, password: rawPassword }) {
  if (!looksLikeToken(token)) return { ok: false, code: "invalid" };

  const name = validateName(rawName);
  if (name.error) return { ok: false, code: "fields", errors: { name: name.error } };
  const password = validatePassword(rawPassword, { minLength: securityConfig.minPasswordLength });
  if (password.error) return { ok: false, code: "fields", errors: { password: password.error } };

  await connectDB();
  const passwordHash = await hashPassword(password.value);

  const invitation = await Invitation.findOneAndUpdate(
    { tokenHash: hashToken(token), status: "pending", expiresAt: { $gt: new Date() } },
    { $set: { status: "accepted", acceptedAt: new Date() } },
    { new: true }
  );
  if (!invitation) return { ok: false, code: "invalid" };

  try {
    // Upsert by email: creates the account, or re-activates a disabled staff account. Admin accounts are never touched.
    await User.findOneAndUpdate(
      { email: invitation.email, role: { $ne: "admin" } },
      { $set: { name: name.value, passwordHash, role: "staff", status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    // Give the invitation back so the admin is not left with a burned link.
    await Invitation.updateOne({ _id: invitation._id }, { $set: { status: "pending" }, $unset: { acceptedAt: 1 } });
    if (err?.code === 11000) return { ok: false, code: "invalid" };
    throw err;
  }
  return { ok: true, email: invitation.email };
}
