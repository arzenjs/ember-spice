"use server";

import { redirect } from "next/navigation";
import { reservationConfig as config } from "@/config/reservations";
import { securityConfig } from "@/config/security";
import { validateReservationInput } from "@/lib/validation";
import { createReservation, deliverConfirmationEmail, getSlotAvailability } from "@/server/reservations";
import { rateLimit } from "@/server/rate-limit";
import { getClientIp } from "@/server/request";

const { rateLimits } = securityConfig;
const TRY_AGAIN = "We could not complete your reservation just now. Please try again in a moment.";

// Read-only lookup used by the form to show which times are open. Rate limited so it cannot be used to hammer the database.
export async function getSlotsAction(date, partySize) {
  try {
    const { allowed } = await rateLimit("slots-ip", await getClientIp(), rateLimits.slotLookupPerIp);
    if (!allowed) return { ok: false, message: "Too many requests. Please wait a moment.", slots: [] };
    return await getSlotAvailability(String(date ?? ""), partySize);
  } catch (err) {
    console.error("[reserve] slot lookup failed:", err);
    return { ok: false, message: "Could not load available times. Please try again.", slots: [] };
  }
}

export async function createReservationAction(_prev, formData) {
  const raw = Object.fromEntries(
    ["guestName", "email", "phone", "date", "time", "partySize"].map((k) => [k, String(formData.get(k) ?? "")])
  );

  let result;
  try {
    const ip = await getClientIp();
    if (!(await rateLimit("reserve-ip", ip, rateLimits.reservePerIp)).allowed) {
      return { message: "Too many reservation attempts. Please try again later or call the restaurant." };
    }

    const checked = validateReservationInput(raw, config);
    if (checked.errors) return { errors: checked.errors, message: "Please correct the highlighted fields." };

    if (!(await rateLimit("reserve-email", checked.values.email, rateLimits.reservePerEmail)).allowed) {
      return { message: "This email address has made too many reservation attempts today. Please call the restaurant." };
    }

    result = await createReservation(checked.values);
    if (!result.ok) {
      // On a lost race, send back fresh availability so the form can show what is still open.
      const refreshed = result.code === "unavailable" ? await getSlotAvailability(raw.date, raw.partySize) : null;
      return { message: result.message, code: result.code, slots: refreshed?.slots };
    }

    // The reservation is saved. A failed email must not undo it: the confirmation page offers a retry.
    await deliverConfirmationEmail(result.reservation, result.token).catch((err) =>
      console.error("[reserve] confirmation email error:", err)
    );
  } catch (err) {
    console.error("[reserve] create failed:", err);
    return { message: TRY_AGAIN };
  }

  // Only reached after a successful save. The token (not the reservation id) is the access key.
  redirect(`/reserve/confirmation/${result.token}`);
}
