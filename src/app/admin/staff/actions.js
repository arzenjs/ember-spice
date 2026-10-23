"use server";

import { revalidatePath } from "next/cache";
import { securityConfig } from "@/config/security";
import { inviteStaff, resendInvitation, revokeInvitation } from "@/server/invitations";
import { rateLimit } from "@/server/rate-limit";
import { setStaffStatus } from "@/server/staff";
import { requireUser } from "@/server/session";

const FAILED = { ok: false, message: "Something went wrong. Please try again." };

export async function inviteStaffAction(_prev, formData) {
  const admin = await requireUser(["admin"]); // verified on the server, regardless of what the UI showed
  try {
    const { allowed } = await rateLimit("invite-admin", admin.id, securityConfig.rateLimits.invitePerAdmin);
    if (!allowed) return { ok: false, message: "Too many invitations sent recently. Please try again later." };
    const result = await inviteStaff({ email: formData.get("email"), admin });
    revalidatePath("/admin/staff");
    return result;
  } catch (err) {
    console.error("[admin] invite failed:", err);
    return FAILED;
  }
}

// Resend / revoke an invitation, or deactivate / reactivate a staff account.
export async function manageStaffAction(_prev, formData) {
  const admin = await requireUser(["admin"]);
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  try {
    let result;
    if (intent === "resend") result = await resendInvitation({ id, admin });
    else if (intent === "revoke") result = await revokeInvitation({ id });
    else if (intent === "deactivate") result = await setStaffStatus({ id, status: "disabled" });
    else if (intent === "reactivate") result = await setStaffStatus({ id, status: "active" });
    else result = { ok: false, message: "Unknown action." };
    revalidatePath("/admin/staff");
    return result;
  } catch (err) {
    console.error("[admin] manage staff failed:", err);
    return FAILED;
  }
}
