import ReservationActions from "./ReservationActions";
import StatusBadge from "@/components/ui/StatusBadge";
import { ACTIVE_STATUSES, nextStatuses } from "@/lib/status";
import { formatDateLong, formatTime12 } from "@/lib/time";

// Server component. Shows one card per reservation; the card layout stays readable on a tablet at the host stand.
export default function ReservationList({ reservations, role, showDate = false, emptyMessage = "No reservations found." }) {
  if (reservations.length === 0) {
    return <p className="rounded-xl bg-ember-charcoal px-6 py-10 text-center text-sand">{emptyMessage}</p>;
  }
  return (
    <ul className="space-y-4">
      {reservations.map((r) => (
        <li key={r.id} className="rounded-xl bg-ember-charcoal p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-2xl">
                {formatTime12(r.time)}
                {showDate && <span className="ml-3 text-base text-sand">{formatDateLong(r.date)}</span>}
              </p>
              <p className="mt-1 text-lg">{r.guestName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-ember-black px-3 py-1 text-sm">{r.partySize} {r.partySize === 1 ? "guest" : "guests"}</span>
              <StatusBadge status={r.status} />
            </div>
          </div>

          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <div><dt className="text-xs uppercase tracking-[0.12em] text-sand">Reference</dt><dd className="font-mono text-base">{r.reference}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-sand">Phone</dt>
              <dd><a className="underline-offset-4 hover:underline" href={`tel:${r.phone}`}>{r.phone}</a></dd></div>
            <div className="min-w-0"><dt className="text-xs uppercase tracking-[0.12em] text-sand">Email</dt><dd className="break-all">{r.email}</dd></div>
          </dl>

          <div className="mt-5 border-t border-ivory/10 pt-4">
            <ReservationActions
              id={r.id}
              actions={nextStatuses(r.status, role)}
              table={r.table}
              canAssignTable={ACTIVE_STATUSES.includes(r.status)}
              canResendEmail
              emailStatus={r.emailStatus}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
