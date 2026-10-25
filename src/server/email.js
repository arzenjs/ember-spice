import { Resend } from "resend";
import { restaurant } from "../config/restaurant.js";
export async function sendEmail({ to, subject, html, text }) {
  const mode = process.env.EMAIL_MODE || "log";

  if (mode === "log") {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "EMAIL_MODE=log is not allowed in production. Set EMAIL_MODE=resend." };
    }
    console.log(`\n[email:log] To: ${to}\n[email:log] Subject: ${subject}\n${text}\n`);
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress) {
    return { ok: false, error: "RESEND_API_KEY and RESEND_FROM_EMAIL must both be set." };
  }
  // Accept either a bare address or a full "Name <address>" value.
  const from = fromAddress.includes("<") ? fromAddress : `${restaurant.name} <${fromAddress}>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to, subject, html, text });
    if (error) return { ok: false, error: error.message || "Resend rejected the email." };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Email request failed." };
  }
}
