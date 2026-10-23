import { escapeHtml } from "../lib/text.js";
import { formatDateLong, formatTime12 } from "../lib/time.js";
import { emailButton, emailColors as c, renderEmailLayout } from "./layout.js";

// Pure template: data in, { subject, html, text } out. No database or network access.
export function buildReservationConfirmationEmail({ reservation, confirmationUrl, restaurant }) {
  const when = `${formatDateLong(reservation.date)} at ${formatTime12(reservation.time)}`;
  const guests = `${reservation.partySize} ${reservation.partySize === 1 ? "guest" : "guests"}`;
  const instruction = "Please show this email or quote your reservation reference at reception when you arrive.";

  const row = (label, value) =>
    `<tr><td style="padding:6px 0;color:${c.sand};width:38%;">${escapeHtml(label)}</td><td style="padding:6px 0;color:${c.ivory};font-weight:600;">${escapeHtml(value)}</td></tr>`;

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;color:${c.ivory};">Your table is confirmed</h1>
    <p style="margin:0 0 20px;">Hello ${escapeHtml(reservation.guestName)}, we look forward to welcoming you.</p>
    <div style="background:${c.black};border-radius:8px;padding:16px 20px;margin:0 0 20px;text-align:center;">
      <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${c.sand};">Reservation reference</div>
      <div style="font-family:'Courier New',monospace;font-size:24px;letter-spacing:0.08em;color:${c.ivory};margin-top:4px;">${escapeHtml(reservation.reference)}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${row("Name", reservation.guestName)}${row("Date & time", when)}${row("Party size", guests)}
    </table>
    <p style="margin:0 0 24px;">${escapeHtml(instruction)}</p>
    <p style="margin:0 0 24px;text-align:center;">${emailButton(confirmationUrl, "View confirmation")}</p>
    <p style="margin:0;font-size:13px;">${escapeHtml(restaurant.name)}<br>${escapeHtml(restaurant.addressLine)}<br>${escapeHtml(restaurant.phone.display)}</p>`;

  const text = [
    `Your table at ${restaurant.name} is confirmed.`,
    "",
    `Reference: ${reservation.reference}`,
    `Name: ${reservation.guestName}`,
    `Date & time: ${when}`,
    `Party size: ${guests}`,
    "",
    instruction,
    `View your confirmation: ${confirmationUrl}`,
    "",
    `${restaurant.name}, ${restaurant.addressLine}, ${restaurant.phone.display}`,
  ].join("\n");

  return {
    subject: `Reservation confirmed: ${reservation.reference}`,
    html: renderEmailLayout({
      restaurantName: restaurant.name,
      tagline: restaurant.tagline,
      preheader: `${when}, ${guests}. Reference ${reservation.reference}.`,
      bodyHtml,
    }),
    text,
  };
}
