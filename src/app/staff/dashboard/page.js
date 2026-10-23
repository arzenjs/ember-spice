import Link from "next/link";
import { CalendarSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { reservationConfig as config } from "@/config/reservations";
import { addDays, formatDateLong, isValidDate, zonedNow } from "@/lib/time";
import { getDaySummary, searchReservations } from "@/server/reservations";
import { requireUser } from "@/server/session";
import InternalShell from "@/components/staff/InternalShell";
import ReservationList from "@/components/staff/ReservationList";
import { buttonStyles } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { STATUS_LABELS } from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata = { title: "Today's Reservations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function StaffDashboardPage({ searchParams }) {
  const user = await requireUser(["staff", "admin"]);
  const params = await searchParams;

  const today = zonedNow(config.timezone).date;
  const requested = first(params.date);
  const date = isValidDate(requested) ? requested : today;
  const q = String(first(params.q) ?? "").trim();
  const page = first(params.page);

  // With a search term, look across all dates (a guest may be holding a reference for another day).
  const result = await searchReservations(q ? { q, from: today, page } : { date, page });
  const summary = q ? null : await getDaySummary(date);
  const link = (d) => `/staff/dashboard?date=${d}`;

  return (
    <InternalShell user={user}>
      <h1 className="font-display text-3xl sm:text-4xl">{q ? "Search results" : date === today ? "Today" : "Reservations"}</h1>
      {!q && <p className="mt-2 text-sand">{formatDateLong(date)}</p>}

      <form method="get" className="mt-8 flex flex-wrap items-end gap-3" role="search">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-sand">Search by reference, name or phone</label>
          <input id="q" name="q" defaultValue={q} placeholder="ES-7K3M-9QX2, Ada, 555…" className={inputClass} />
        </div>
        <div>
          <label htmlFor="date" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-sand">Date</label>
          <input id="date" type="date" name="date" defaultValue={date} className={inputClass} />
        </div>
        <button className={buttonStyles("primary")}><CalendarSearch size={16} aria-hidden="true" /> Search</button>
        {q && <Link href="/staff/dashboard" className={buttonStyles("secondary")}>Clear search</Link>}
      </form>
      {q && <p className="mt-3 text-sm text-sand">Searching upcoming reservations from today onward. Clear the search to return to the day view.</p>}

      {!q && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={link(addDays(date, -1))} className={cn(buttonStyles("secondary"), "!px-4")} aria-label="Previous day"><ChevronLeft size={16} aria-hidden="true" /> Prev</Link>
          <Link href={link(today)} className={buttonStyles("secondary")}>Today</Link>
          <Link href={link(addDays(date, 1))} className={cn(buttonStyles("secondary"), "!px-4")} aria-label="Next day">Next <ChevronRight size={16} aria-hidden="true" /></Link>
        </div>
      )}

      {summary && (
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(summary.byStatus).map(([status, v]) => (
            <div key={status} className="rounded-xl bg-ember-charcoal px-4 py-3">
              <dt className="text-xs uppercase tracking-[0.12em] text-sand">{STATUS_LABELS[status]}</dt>
              <dd className="font-display text-2xl">{v.reservations}<span className="ml-2 text-sm text-sand">{v.guests} guests</span></dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8">
        <ReservationList reservations={result.items} role={user.role} showDate={Boolean(q)}
          emptyMessage={q ? "No upcoming reservations match your search." : "No reservations for this date."} />
      </div>

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm text-sand">
          {result.page > 1 ? <Link className="underline" href={`/staff/dashboard?${new URLSearchParams({ ...(q ? { q } : { date }), page: String(result.page - 1) })}`}>← Previous page</Link> : <span />}
          <span>Page {result.page} of {result.pageCount}</span>
          {result.page < result.pageCount ? <Link className="underline" href={`/staff/dashboard?${new URLSearchParams({ ...(q ? { q } : { date }), page: String(result.page + 1) })}`}>Next page →</Link> : <span />}
        </nav>
      )}
    </InternalShell>
  );
}
