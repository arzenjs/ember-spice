import { escapeHtml } from "../lib/text.js";
import { emailButton, emailColors as c, renderEmailLayout } from "./layout.js";

export function buildStaffInvitationEmail({ acceptUrl, invitedByName, expiresInHours, restaurant }) {
  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;color:${c.ivory};">You have been invited</h1>
    <p style="margin:0 0 20px;">${escapeHtml(invitedByName)} has invited you to join the ${escapeHtml(restaurant.name)} team on the staff reservation system.</p>
    <p style="margin:0 0 24px;text-align:center;">${emailButton(acceptUrl, "Accept invitation")}</p>
    <p style="margin:0 0 8px;font-size:13px;">This link works once and expires in ${escapeHtml(expiresInHours)} hours. You will choose your password on the next page and be signed in automatically.</p>
    <p style="margin:0;font-size:13px;">If you were not expecting this invitation, you can ignore this email.</p>`;

  const text = [
    `${invitedByName} has invited you to join the ${restaurant.name} team on the staff reservation system.`,
    "",
    `Accept the invitation: ${acceptUrl}`,
    "",
    `This link works once and expires in ${expiresInHours} hours.`,
    "If you were not expecting this invitation, you can ignore this email.",
  ].join("\n");

  return {
    subject: `You're invited to the ${restaurant.name} staff team`,
    html: renderEmailLayout({
      restaurantName: restaurant.name,
      tagline: restaurant.tagline,
      preheader: "Accept your invitation and set your password.",
      bodyHtml,
    }),
    text,
  };
}
