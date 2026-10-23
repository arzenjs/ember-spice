"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { securityConfig } from "@/config/security";
import { safeInternalPath } from "@/lib/safe-redirect";
import { acceptInvitation } from "@/server/invitations";
import { rateLimit } from "@/server/rate-limit";
import { getClientIp } from "@/server/request";

// One message for every failure (wrong password, unknown email, disabled account, rate limit).
const LOGIN_FAILED = "We could not sign you in. Check your email and password, or try again later.";

export async function loginAction(_prev, formData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email address and password.", email };

  // Where to go afterwards is decided by /staff/post-login from the user's verified role.
  // `next` is only a hint and is checked against an allow-list there.
  const next = safeInternalPath(formData.get("next"));
  const redirectTo = next ? `/staff/post-login?next=${encodeURIComponent(next)}` : "/staff/post-login";

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) return { error: LOGIN_FAILED, email };
    throw err; // includes the redirect that signals success
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/staff/login" });
}

// Sets the password, activates the account, then signs the user in with the same credentials:
// no second manual login is needed.
export async function acceptInvitationAction(_prev, formData) {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password !== confirm) return { errors: { confirmPassword: "Passwords do not match." }, name };

  let result;
  try {
    const { allowed } = await rateLimit("accept-invite", await getClientIp(), securityConfig.rateLimits.acceptInvitePerIp);
    if (!allowed) return { message: "Too many attempts. Please wait a few minutes and try again.", name };
    result = await acceptInvitation({ token, name, password });
  } catch (err) {
    console.error("[staff] accept invitation failed:", err);
    return { message: "Something went wrong. Please try again.", name };
  }

  if (!result.ok) {
    if (result.code === "fields") return { errors: result.errors, name };
    return { invalid: true };
  }

  try {
    await signIn("credentials", { email: result.email, password, redirectTo: "/staff/dashboard" });
  } catch (err) {
    // The account is active; only the automatic sign-in failed (for example a rate limit). Fall back to the login page.
    if (err instanceof AuthError) redirect("/staff/login?activated=1");
    throw err;
  }
}
