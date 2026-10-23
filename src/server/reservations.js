import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import { reservationConfig as config } from "../config/reservations.js";
import { securityConfig } from "../config/security.js";
import { restaurant } from "../config/restaurant.js";
import { getSiteUrl } from "../config/site.js";
import { buildReservationConfirmationEmail } from "../emails/reservation-confirmation.js";
import { coveredSlots, dateProblem, listBookableTimes } from "../lib/availability.js";
import { ACTIVE_STATUSES, SEAT_RELEASING_STATUSES, STATUSES, allowedFromStatuses, canChangeStatus } from "../lib/status.js";
import { escapeRegex } from "../lib/text.js";
import { formatTime12, isValidDate, minutesToTime, timeToMinutes, zonedNow } from "../lib/time.js";
import { generateReference, generateToken, hashToken, looksLikeToken, normalizeReference } from "../lib/tokens.js";
import { getBookedSeatsByDate, releaseSeats, reserveSeats } from "./capacity.js";
import { connectDB } from "./db.js";
import { sendEmail } from "./email.js";

// Plain, serialisable shape handed to pages and components (never the raw Mongoose document).
export function toReservationView(r) {
  return {
    id: String(r._id),
    reference: r.reference,
    guestName: r.guestName,
    email: r.email,
    phone: r.phone,
    date: r.date,
    time: r.time,
    partySize: r.partySize,
    status: r.status,
    table: r.table || "",
    emailStatus: r.emailStatus,
  };
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

// Every rule-valid start time on `date`, each flagged with whether the room still has space for the party.
export async function getSlotAvailability(date, partySize, now = new Date()) {
  const problem = dateProblem(date, config, now);
  if (problem) return { ok: false, message: problem, slots: [] };
  const size = Number(partySize);
  if (!Number.isInteger(size) || size < config.minPartySize || size > config.maxPartySize) {
    return { ok: false, message: "Please choose a valid party size.", slots: [] };
  }

  await connectDB();
  const booked = await getBookedSeatsByDate(date);
  const slots = listBookableTimes(date, config, now).map((time) => {
    const fits = coveredSlots(timeToMinutes(time), config).every(
      (slot) => (booked.get(slot) ?? 0) + size <= config.seatCapacity
    );
    return { time, label: formatTime12(time), available: fits };
  });
  const message = slots.length ? "" : "No more times are available on that day. Please choose another date.";
  return { ok: true, message, slots };
}

// ---------------------------------------------------------------------------
// Creating a reservation
// ---------------------------------------------------------------------------

// `values` must already have passed validateReservationInput.
// Order matters: claim seats atomically, then save. If saving fails, the seats are returned.
export async function createReservation(values, { now = new Date() } = {}) {
  await connectDB();

  const today = zonedNow(config.timezone, now).date;
  const upcoming = await Reservation.find({ email: values.email, date: { $gte: today }, status: { $in: ACTIVE_STATUSES } })
    .select("date time")
    .lean();
  if (upcoming.some((r) => r.date === values.date && r.time === values.time)) {
    return { ok: false, code: "duplicate", message: "You already have a reservation at that date and time." };
  }
  if (upcoming.length >= config.maxActiveReservationsPerEmail) {
    return {
      ok: false,
      code: "limit",
      message: `This email already has ${config.maxActiveReservationsPerEmail} upcoming reservations. Please contact the restaurant to make changes.`,
    };
  }

  const startMinutes = timeToMinutes(values.time);
  const slots = coveredSlots(startMinutes, config);
  const held = await reserveSeats(values.date, slots, values.partySize, config.seatCapacity);
  if (!held) {
    return { ok: false, code: "unavailable", message: "Sorry, that time has just been taken. Please choose another time." };
  }

  const token = generateToken();
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const doc = await Reservation.create({
          ...values,
          startMinutes,
          reference: generateReference(),
          tokenHash: hashToken(token),
          emailAttempts: 1, // the initial send, made by the caller right after this returns
          lastEmailAttemptAt: now,
        });
        return { ok: true, reservation: doc.toObject(), token };
      } catch (err) {
        if (err?.code === 11000 && err.keyPattern?.reference) continue; // reference collision: pick another
        throw err;
      }
    }
    throw new Error("Could not generate a unique reservation reference.");
  } catch (err) {
    await releaseSeats(values.date, slots, values.partySize).catch(() => {});
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Confirmation page and email
// ---------------------------------------------------------------------------

export async function findReservationByToken(token) {
  if (!looksLikeToken(token)) return null;
  await connectDB();
  return Reservation.findOne({ tokenHash: hashToken(token) }).lean();
}

export const confirmationUrl = (token) => `${getSiteUrl()}/reserve/confirmation/${token}`;

// Sends the confirmation email for an already-saved reservation and records the outcome.
export async function deliverConfirmationEmail(reservation, token) {
  const email = buildReservationConfirmationEmail({ reservation, confirmationUrl: confirmationUrl(token), restaurant });
  const result = await sendEmail({ to: reservation.email, ...email });
  if (!result.ok) console.error(`[email] Confirmation for ${reservation.reference} not sent: ${result.error}`);
  await Reservation.updateOne({ _id: reservation._id }, { $set: { emailStatus: result.ok ? "sent" : "failed" } });
  return result.ok;
}

// Atomically reserve the right to send one more email. Enforces the attempt cap and the cooldown,
// so double-clicks and scripted abuse cannot trigger a flood of emails.
function claimEmailAttempt(filter) {
  const cooldownStart = new Date(Date.now() - securityConfig.confirmationEmailCooldownSeconds * 1000);
  return Reservation.findOneAndUpdate(
    {
      ...filter,
      emailAttempts: { $lt: securityConfig.maxConfirmationEmailAttempts },
      $or: [{ lastEmailAttemptAt: null }, { lastEmailAttemptAt: { $lt: cooldownStart } }],
    },
    { $inc: { emailAttempts: 1 }, $set: { lastEmailAttemptAt: new Date() } },
    { new: true }
  ).lean();
}

// Customer retry from the confirmation page. Never creates a reservation, only re-sends the email.
export async function retryConfirmationEmail(token) {
  if (!looksLikeToken(token)) return { ok: false, message: "This confirmation link is not valid." };
  await connectDB();
  const reservation = await claimEmailAttempt({ tokenHash: hashToken(token) });
  if (!reservation) {
    return { ok: false, message: "We cannot resend the email right now. Please wait a minute and try again, or contact the restaurant." };
  }
  const sent = await deliverConfirmationEmail(reservation, token);
  return sent
    ? { ok: true, message: "Confirmation email sent." }
    : { ok: false, message: "The email still could not be sent. Your reservation is safe; please keep your reference." };
}

// Staff retry. We only store a hash of the access token, so a fresh token is issued (the old link stops working).
export async function reissueConfirmationEmail(reservationId) {
  if (!mongoose.isValidObjectId(reservationId)) return { ok: false, message: "Reservation not found." };
  await connectDB();
  const reservation = await claimEmailAttempt({ _id: reservationId });
  if (!reservation) return { ok: false, message: "Email cannot be resent right now (cooldown or attempt limit reached)." };
  const token = generateToken();
  await Reservation.updateOne({ _id: reservation._id }, { $set: { tokenHash: hashToken(token) } });
  const sent = await deliverConfirmationEmail(reservation, token);
  return sent ? { ok: true, message: "Confirmation email sent." } : { ok: false, message: "Email delivery failed. Check the email configuration." };
}

// ---------------------------------------------------------------------------
// Staff and admin operations
// ---------------------------------------------------------------------------

const PAGE_SIZE = 25;

// Filters come from URL parameters: every value is coerced to a string and checked before use,
// and no user-supplied object is ever placed in a query.
export async function searchReservations({ date, from, status, time, q, page = 1 } = {}) {
  await connectDB();
  const query = {};
  if (isValidDate(date)) query.date = date;
  else if (isValidDate(from)) query.date = { $gte: from };
  if (STATUSES.includes(status)) query.status = status;
  const startMinutes = timeToMinutes(time);
  if (startMinutes !== null) query.startMinutes = startMinutes;

  const text = String(q ?? "").trim().slice(0, 80);
  if (text) {
    const or = [{ guestName: { $regex: escapeRegex(text), $options: "i" } }];
    const reference = normalizeReference(text);
    if (reference) or.push({ reference });
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 3) or.push({ phoneDigits: { $regex: escapeRegex(digits) } });
    if (text.includes("@")) or.push({ email: text.toLowerCase() });
    query.$or = or;
  }

  const pageNumber = Math.max(1, Math.floor(Number(page)) || 1);
  const [items, total] = await Promise.all([
    Reservation.find(query).sort({ date: 1, startMinutes: 1, createdAt: 1 }).skip((pageNumber - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Reservation.countDocuments(query),
  ]);
  return { items: items.map(toReservationView), total, page: pageNumber, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

// Counts and guest totals per status for one day, plus upcoming confirmed bookings.
export async function getDaySummary(date) {
  await connectDB();
  const today = zonedNow(config.timezone).date;
  const [rows, upcoming] = await Promise.all([
    Reservation.aggregate([
      { $match: { date } },
      { $group: { _id: "$status", reservations: { $sum: 1 }, guests: { $sum: "$partySize" } } },
    ]),
    Reservation.countDocuments({ date: { $gt: today }, status: "confirmed" }),
  ]);
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, { reservations: 0, guests: 0 }]));
  for (const row of rows) byStatus[row._id] = { reservations: row.reservations, guests: row.guests };
  return { byStatus, upcoming };
}

async function releaseHeldSeats(reservation) {
  // The flag flip makes this idempotent: only the request that flips it returns the seats.
  const flipped = await Reservation.findOneAndUpdate({ _id: reservation._id, seatsHeld: true }, { $set: { seatsHeld: false } });
  if (flipped) await releaseSeats(reservation.date, coveredSlots(reservation.startMinutes, config), reservation.partySize);
}

export async function updateReservationStatus({ id, to, user }) {
  if (!mongoose.isValidObjectId(id) || !STATUSES.includes(to)) return { ok: false, message: "Invalid request." };
  if (!canChangeStatus(user.role, to)) return { ok: false, message: "You are not allowed to make that change." };
  await connectDB();

  const now = new Date();
  const set = { status: to, statusUpdatedBy: user.id };
  if (to === "arrived") set.arrivedAt = now;
  if (to === "seated") set.seatedAt = now;
  if (to === "confirmed") set.arrivedAt = null;

  // The filter encodes the allowed transition, so concurrent or stale clicks cannot corrupt the state.
  const updated = await Reservation.findOneAndUpdate({ _id: id, status: { $in: allowedFromStatuses(to) } }, { $set: set }, { new: true }).lean();
  if (!updated) return { ok: false, message: "That reservation has changed. Refresh the page and try again." };

  if (SEAT_RELEASING_STATUSES.includes(to)) await releaseHeldSeats(updated);
  return { ok: true, reservation: toReservationView(updated) };
}

export async function assignTable({ id, table }) {
  const value = String(table ?? "").trim();
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Invalid request." };
  if (!/^[A-Za-z0-9 .\-/#]{0,20}$/.test(value)) return { ok: false, message: "Table names may use letters, numbers and . - / # (20 characters max)." };
  await connectDB();
  const updated = await Reservation.findOneAndUpdate({ _id: id, status: { $in: ACTIVE_STATUSES } }, { $set: { table: value } }, { new: true }).lean();
  return updated ? { ok: true } : { ok: false, message: "Tables can only be assigned to active reservations." };
}

export const timeOptions = () => {
  // Filter dropdown values: every slot the restaurant could ever start a booking.
  const all = new Set();
  for (const hours of Object.values(config.openingHours)) {
    const last = timeToMinutes(hours.closes) - config.lastSeatingBeforeCloseMinutes;
    for (let m = timeToMinutes(hours.opens); m <= last; m += config.slotMinutes) all.add(minutesToTime(m));
  }
  return [...all].sort().map((time) => ({ time, label: formatTime12(time) }));
};
