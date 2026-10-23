import test from "node:test";
import assert from "node:assert/strict";
import { reservationConfig as config } from "../src/config/reservations.js";
import { addDays, daysBetween, formatTime12, isValidDate, timeToMinutes, zonedNow } from "../src/lib/time.js";
import { coveredSlots, dateProblem, listBookableTimes } from "../src/lib/availability.js";
import { validateReservationInput, validatePassword } from "../src/lib/validation.js";

// 2026-10-20 is a Tuesday (open); 2026-10-26 is a Monday (closed).
// 15:00 UTC on 2026-10-20 = 11:00 in New York (EDT, UTC-4).
const NOW = new Date("2026-10-20T15:00:00Z");
const cfg = { ...config, timezone: "America/New_York" };

test("time helpers", () => {
  assert.equal(isValidDate("2026-02-29"), false);
  assert.equal(isValidDate("2028-02-29"), true);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(daysBetween("2026-10-20", "2026-10-27"), 7);
  assert.equal(timeToMinutes("24:00"), null);
  assert.equal(formatTime12("17:30"), "5:30 PM");
  assert.equal(formatTime12("00:00"), "12:00 AM");
  assert.deepEqual(zonedNow("America/New_York", NOW), { date: "2026-10-20", minutes: 11 * 60 });
  // Same instant is already tomorrow in Tokyo.
  assert.equal(zonedNow("Asia/Tokyo", new Date("2026-10-20T20:00:00Z")).date, "2026-10-21");
});

test("opening hours come from restaurant config: closed Monday, open Tuesday", () => {
  assert.match(dateProblem("2026-10-26", cfg, NOW), /closed/);
  assert.equal(dateProblem("2026-10-21", cfg, NOW), null);
});

test("bookable times respect hours, last seating and slot spacing", () => {
  const times = listBookableTimes("2026-10-21", cfg, NOW);
  assert.equal(times[0], "17:30");
  assert.equal(times.at(-1), "21:30"); // 23:00 close minus 90 minutes
  assert.equal(times.length, 9);
});

test("lead time hides near-term slots on the same day", () => {
  const late = new Date("2026-10-20T21:30:00Z"); // 17:30 local
  const times = listBookableTimes("2026-10-20", cfg, late);
  assert.equal(times[0], "18:30"); // 60 minute lead time
  const tooLate = new Date("2026-10-21T01:00:00Z"); // 21:00 local
  assert.deepEqual(listBookableTimes("2026-10-20", cfg, tooLate), []);
});

test("past dates and dates beyond the booking window are rejected", () => {
  assert.match(dateProblem("2026-10-13", cfg, NOW), /future/);
  assert.match(dateProblem("2027-03-02", cfg, NOW), /days ahead/);
  assert.match(dateProblem("not-a-date", cfg, NOW), /valid date/);
});

test("a booking holds seats in every slot it overlaps", () => {
  assert.deepEqual(coveredSlots(17 * 60 + 30, cfg), [1050, 1080, 1110]);
});

const good = { guestName: "  Ada   Lovelace ", email: "ADA@Example.com ", phone: "+1 (555) 010-2030", date: "2026-10-21", time: "19:00", partySize: "4" };

test("valid input is normalised", () => {
  const r = validateReservationInput(good, cfg, NOW);
  assert.equal(r.errors, undefined);
  assert.equal(r.values.guestName, "Ada Lovelace");
  assert.equal(r.values.email, "ada@example.com");
  assert.equal(r.values.phoneDigits, "15550102030");
  assert.equal(r.values.partySize, 4);
});

test("invalid fields are reported individually", () => {
  const r = validateReservationInput(
    { guestName: "A", email: "nope", phone: "12", date: "2026-10-26", time: "19:00", partySize: "99" },
    cfg,
    NOW
  );
  assert.deepEqual(Object.keys(r.errors).sort(), ["date", "email", "guestName", "partySize", "phone"]);
});

test("unavailable or malformed times are rejected", () => {
  for (const time of ["17:15", "22:30", "abc", ""]) {
    assert.ok(validateReservationInput({ ...good, time }, cfg, NOW).errors.time, time);
  }
});

test("party size must be an integer within limits", () => {
  for (const partySize of ["0", "9", "2.5", "abc", "-1"]) {
    assert.ok(validateReservationInput({ ...good, partySize }, cfg, NOW).errors.partySize, partySize);
  }
});

test("injection-style values cannot sneak through as objects", () => {
  const r = validateReservationInput({ ...good, email: { $ne: "" }, guestName: ["x"] }, cfg, NOW);
  assert.ok(r.errors.email);
});

test("password rules", () => {
  assert.ok(validatePassword("short", { minLength: 10 }).error);
  assert.ok(validatePassword("a".repeat(80), { minLength: 10 }).error);
  assert.ok(validatePassword("me@x.com", { minLength: 5, email: "ME@x.com" }).error);
  assert.equal(validatePassword("correct horse battery", { minLength: 10 }).value, "correct horse battery");
});
