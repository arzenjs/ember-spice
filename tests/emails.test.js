import test from "node:test";
import assert from "node:assert/strict";
import { restaurant } from "../src/config/restaurant.js";
import { buildReservationConfirmationEmail } from "../src/emails/reservation-confirmation.js";
import { buildStaffInvitationEmail } from "../src/emails/staff-invitation.js";
import { escapeHtml } from "../src/lib/text.js";

const reservation = { reference: "ES-7K3M-9QX2", guestName: `Ada <script>alert(1)</script>`, date: "2026-10-21", time: "19:00", partySize: 4 };

test("confirmation email contains every required detail", () => {
  const e = buildReservationConfirmationEmail({ reservation, confirmationUrl: "https://example.com/reserve/confirmation/abc", restaurant });
  for (const needle of ["ES-7K3M-9QX2", "7:00 PM", "4 guests", "Wednesday, October 21, 2026", "reception", "https://example.com/reserve/confirmation/abc", escapeHtml(restaurant.name)]) {
    assert.ok(e.html.includes(needle), `html missing ${needle}`);
  }
  assert.ok(e.text.includes("ES-7K3M-9QX2") && e.text.includes("reception"));
  assert.match(e.subject, /ES-7K3M-9QX2/);
});

test("guest-supplied text is HTML-escaped in emails", () => {
  const e = buildReservationConfirmationEmail({ reservation, confirmationUrl: "https://example.com/x", restaurant });
  assert.ok(!e.html.includes("<script>"));
  assert.ok(e.html.includes("&lt;script&gt;"));
});

test("invitation email has the accept link and expiry", () => {
  const e = buildStaffInvitationEmail({ acceptUrl: "https://example.com/staff/accept-invitation?token=t", invitedByName: "Owner", expiresInHours: 72, restaurant });
  assert.ok(e.html.includes("accept-invitation?token=t"));
  assert.ok(e.html.includes("72 hours"));
  assert.ok(e.text.includes("accept-invitation?token=t"));
});
