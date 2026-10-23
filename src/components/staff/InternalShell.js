import Link from "next/link";
import { logoutAction } from "@/app/staff/auth-actions";
import { restaurant } from "@/config/restaurant";
import Container from "@/components/ui/Container";
import SubmitButton from "@/components/ui/SubmitButton";

// Frame for every signed-in staff/admin page. Server component: the links shown are only a convenience,
// real access control happens in requireUser() on each page and action.
export default function InternalShell({ user, children }) {
  const link = "text-xs font-semibold uppercase tracking-[0.12em] text-sand hover:text-ivory";
  return (
    <div className="min-h-screen pt-[env(safe-area-inset-top)]">
      <header className="border-b border-ivory/10 bg-ember-black">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <span className="font-display text-xl">{restaurant.name} <span className="text-sand">· Staff</span></span>
            <nav aria-label="Staff" className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link href="/staff/dashboard" className={link}>Today</Link>
              {user.role === "admin" && <Link href="/admin" className={link}>Reservations</Link>}
              {user.role === "admin" && <Link href="/admin/staff" className={link}>Staff &amp; invitations</Link>}
              <Link href="/" className={link}>Website</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-sand">{user.name} <span className="uppercase tracking-[0.1em]">({user.role})</span></span>
            <form action={logoutAction}>
              <SubmitButton variant="secondary" pendingLabel="Signing out…" className="!min-h-9 !px-4 !py-1.5">Sign out</SubmitButton>
            </form>
          </div>
        </Container>
      </header>
      <Container className="py-10">{children}</Container>
    </div>
  );
}
