"use server";

import { revalidatePath } from "next/cache";
import { getClientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { securityConfig } from "@/config/security";
import { retryConfirmationEmail } from "@/server/reservations";

// Re-sends the email for an existing reservation. It cannot create bookings.
export async function resendConfirmationEmailAction(_prev, formData) {
  const token = String(formData.get("token") ?? "");
  try {
    const { allowed } = await rateLimit("resend-ip", await getClientIp(), securityConfig.rateLimits.reservePerIp);
    if (!allowed) return { ok: false, message: "Too many requests. Please try again later." };
    const result = await retryConfirmationEmail(token);
    if (result.ok) revalidatePath(`/reserve/confirmation/${token}`);
    return result;
  } catch (err) {
    console.error("[reserve] resend failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
