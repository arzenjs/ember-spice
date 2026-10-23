import { notFound } from "next/navigation";
import { CalendarDays, CircleCheck, Clock, Users } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import { formatDateLong, formatTime12 } from "@/lib/time";
import { maskEmail } from "@/lib/text";
import { findReservationByToken } from "@/server/reservations";
import ResendEmailForm from "@/components/reserve/ResendEmailForm";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import StatusBadge from "@/components/ui/StatusBadge";

export const metadata = {
  title: "Reservation Confirmation",
  robots: { index: false, follow: false },
  referrer: "no-referrer", // keep the secret link out of Referer headers
};
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }) {
  const { token } = await params;
  const reservation = await findReservationByToken(token); // looked up by hash of the secret token only
  if (!reservation) notFound();

  const cancelled = reservation.status === "cancelled" || reservation.status === "no_show";
  const detail = "flex items-start gap-3";

  return (
    <Section className="min-h-[70vh]">
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl bg-ember-charcoal p-6 sm:p-10">
          <div className="flex items-center gap-3 text-copper-soft">
            <CircleCheck size={28} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {cancelled ? "Reservation update" : "Reservation confirmed"}
            </p>
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">
            {cancelled ? "This reservation is no longer active" : `Thank you, ${reservation.guestName.split(" ")[0]}`}
          </h1>

          <div className="mt-8 rounded-lg bg-ember-black px-5 py-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">Reservation reference</p>
            <p className="mt-1 break-all font-mono text-2xl tracking-widest sm:text-3xl">{reservation.reference}</p>
            <div className="mt-3"><StatusBadge status={reservation.status} /></div>
          </div>

          <dl className="mt-8 space-y-4">
            <div className={detail}>
              <Users size={20} className="mt-0.5 shrink-0 text-copper-soft" aria-hidden="true" />
              <div><dt className="text-xs uppercase tracking-[0.12em] text-sand">Guest</dt><dd className="text-lg">{reservation.guestName}</dd></div>
            </div>
            <div className={detail}>
              <CalendarDays size={20} className="mt-0.5 shrink-0 text-copper-soft" aria-hidden="true" />
              <div><dt className="text-xs uppercase tracking-[0.12em] text-sand">Date</dt><dd className="text-lg">{formatDateLong(reservation.date)}</dd></div>
            </div>
            <div className={detail}>
              <Clock size={20} className="mt-0.5 shrink-0 text-copper-soft" aria-hidden="true" />
              <div><dt className="text-xs uppercase tracking-[0.12em] text-sand">Time and party size</dt>
                <dd className="text-lg">{formatTime12(reservation.time)} · {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}</dd></div>
            </div>
          </dl>

          {!cancelled && (
            <p className="mt-8 text-base leading-7 text-sand">
              Please show this confirmation, or quote your reference, at reception when you arrive.
            </p>
          )}

          <div className="mt-8 space-y-4">
            {reservation.emailStatus === "sent" && (
              <Alert variant="info">A confirmation email was sent to {maskEmail(reservation.email)}.</Alert>
            )}
            {reservation.emailStatus !== "sent" && (
              <>
                <Alert variant="warning">
                  We could not email your confirmation. Your reservation is saved: keep this page or note your reference.
                </Alert>
                <ResendEmailForm token={token} />
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/">Back to {restaurant.name}</Button>
            <Button href={`tel:${restaurant.phone.tel}`} variant="secondary">Call the restaurant</Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
