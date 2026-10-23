"use server";

import { revalidatePath } from "next/cache";
import { assignTable, reissueConfirmationEmail, updateReservationStatus } from "@/server/reservations";
import { requireUser } from "@/server/session";

// One action for every button on a reservation row. Authentication and role are verified on the
// server every time; nothing the browser sends is trusted for permissions.
export async function reservationAction(_prev, formData) {
  const user = await requireUser(["staff", "admin"]);
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");

  let result;
  try {
    if (intent === "status") {
      result = await updateReservationStatus({ id, to: String(formData.get("to") ?? ""), user });
    } else if (intent === "table") {
      result = await assignTable({ id, table: formData.get("table") });
    } else if (intent === "email") {
      result = await reissueConfirmationEmail(id);
    } else {
      result = { ok: false, message: "Unknown action." };
    }
  } catch (err) {
    console.error("[staff] reservation action failed:", err);
    result = { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/staff/dashboard");
  revalidatePath("/admin");
  return { ok: result.ok, message: result.message ?? "" };
}
