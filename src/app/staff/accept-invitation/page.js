import Link from "next/link";
import { redirect } from "next/navigation";
import { restaurant } from "@/config/restaurant";
import { securityConfig } from "@/config/security";
import { homePathForRole } from "@/lib/safe-redirect";
import { inspectInvitation } from "@/server/invitations";
import { getCurrentUser } from "@/server/session";
import AcceptInvitationForm from "@/components/staff/AcceptInvitationForm";
import Alert from "@/components/ui/Alert";
import Container from "@/components/ui/Container";

export const metadata = { title: "Accept Invitation", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

const PROBLEMS = {
  invalid: "This invitation link is not valid.",
  expired: "This invitation has expired.",
  used: "This invitation has already been used. If that was you, simply sign in.",
  revoked: "This invitation has been cancelled.",
};

export default async function AcceptInvitationPage({ searchParams }) {
  const { token } = await searchParams;
  const signedIn = await getCurrentUser();
  if (signedIn) redirect(homePathForRole(signedIn.role));

  const invitation = await inspectInvitation(typeof token === "string" ? token : "");

  return (
    <Container className="flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-md">
        <p className="text-center font-display text-3xl">{restaurant.name}</p>
        <div className="mt-8 rounded-xl bg-ember-charcoal p-6 sm:p-8">
          <h1 className="font-display text-2xl">Join the team</h1>
          {invitation.state === "valid" ? (
            <>
              <p className="mt-2 text-sm text-sand">Set your password to activate your account. You will be signed in automatically.</p>
              <div className="mt-6">
                <AcceptInvitationForm token={token} email={invitation.email} minPasswordLength={securityConfig.minPasswordLength} />
              </div>
            </>
          ) : (
            <div className="mt-6 space-y-4">
              <Alert variant="error">{PROBLEMS[invitation.state]}</Alert>
              <p className="text-sm text-sand">
                {invitation.state === "used" ? "" : "Please ask the restaurant owner to send you a new invitation."}
              </p>
              <Link href="/staff/login" className="text-sm underline underline-offset-4">Go to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
