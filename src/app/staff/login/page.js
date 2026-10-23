import Link from "next/link";
import { redirect } from "next/navigation";
import { restaurant } from "@/config/restaurant";
import { homePathForRole, safeInternalPath } from "@/lib/safe-redirect";
import { inspectInvitation } from "@/server/invitations";
import { getCurrentUser } from "@/server/session";
import LoginForm from "@/components/staff/LoginForm";
import Alert from "@/components/ui/Alert";
import Container from "@/components/ui/Container";

export const metadata = { title: "Staff Login", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function StaffLoginPage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(homePathForRole(user.role)); // already signed in

  // Arriving from an invitation link: prefill the invited email (only revealed for a still-valid token).
  const invitation = typeof params.invite === "string" ? await inspectInvitation(params.invite) : null;
  const next = safeInternalPath(params.next) ?? "";

  return (
    <Container className="flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md">
        <p className="text-center font-display text-3xl">{restaurant.name}</p>
        <div className="mt-8 rounded-xl bg-ember-charcoal p-6 sm:p-8">
          <h1 className="font-display text-2xl">Staff sign in</h1>
          <p className="mt-2 text-sm text-sand">For restaurant owners and staff. Guests do not need an account to book.</p>
          <div className="mt-6 space-y-5">
            {params.activated && <Alert variant="success">Your account is active. Please sign in.</Alert>}
            {invitation?.state === "valid" && (
              <Alert variant="info">Have you set your password yet? <Link className="underline" href={`/staff/accept-invitation?token=${encodeURIComponent(params.invite)}`}>Accept your invitation</Link> first.</Alert>
            )}
            <LoginForm defaultEmail={invitation?.state === "valid" ? invitation.email : ""} next={next} />
          </div>
        </div>
        <p className="mt-6 text-center text-sm"><Link href="/" className="text-sand hover:text-ivory">← Back to the restaurant website</Link></p>
      </div>
    </Container>
  );
}
