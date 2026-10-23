import Link from "next/link";
import { Search } from "lucide-react";
import { reservationConfig as config } from "@/config/reservations";
import { isValidDate, zonedNow } from "@/lib/time";
import { STATUSES, STATUS_LABELS } from "@/lib/status";
import { getDaySummary, searchReservations, timeOptions } from "@/server/reservations";
import { requireUser } from "@/server/session";
import InternalShell from "@/components/staff/InternalShell";
import ReservationList from "@/components/staff/ReservationList";
import { buttonStyles } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";

export const metadata = { title: "Admin · Reservations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPage({ searchParams }) {
  const user = await requireUser(["admin"]); // staff are redirected to their own dashboard
  const params = await searchParams;

  const today = zonedNow(config.timezone).date;
  const filters = {
    date: first(params.date) ?? "",
    time: first(params.time) ?? "",
    status: first(params.status) ?? "",
    q: String(first(params.q) ?? "").trim(),
    page: first(params.page),
  };
  // No date filter: show everything from today onward so the default view is useful.
  const result = await searchReservations({ ...filters, from: isValidDate(filters.date) ? undefined : today });
  const summary = await getDaySummary(today);

  const label = "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-sand";
  const pageHref = (p) => `/admin?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && k !== "page")), page: String(p) })}`;

  return (
    <InternalShell user={user}>
      <h1 className="font-display text-3xl sm:text-4xl">Reservations overview</h1>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl bg-ember-charcoal px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.12em] text-sand">Upcoming (after today)</dt>
          <dd className="font-display text-2xl">{summary.upcoming}</dd>
        </div>
        {STATUSES.map((s) => (
          <div key={s} className="rounded-xl bg-ember-charcoal px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.12em] text-sand">Today · {STATUS_LABELS[s]}</dt>
            <dd className="font-display text-2xl">{summary.byStatus[s].reservations}<span className="ml-2 text-sm text-sand">{summary.byStatus[s].guests}</span></dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-sand">Small numbers beside each count are guests.</p>

      <form method="get" role="search" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2"><label htmlFor="q" className={label}>Search</label>
          <input id="q" name="q" defaultValue={filters.q} placeholder="Reference, name, phone or email" className={inputClass} /></div>
        <div><label htmlFor="date" className={label}>Date</label><input id="date" type="date" name="date" defaultValue={filters.date} className={inputClass} /></div>
        <div><label htmlFor="time" className={label}>Time</label>
          <select id="time" name="time" defaultValue={filters.time} className={inputClass}>
            <option value="">Any time</option>
            {timeOptions().map((t) => <option key={t.time} value={t.time}>{t.label}</option>)}
          </select></div>
        <div><label htmlFor="status" className={label}>Status</label>
          <select id="status" name="status" defaultValue={filters.status} className={inputClass}>
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select></div>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-5">
          <button className={buttonStyles("primary")}><Search size={16} aria-hidden="true" /> Apply filters</button>
          <Link href="/admin" className={buttonStyles("secondary")}>Reset</Link>
        </div>
      </form>

      <p className="mt-8 text-sm text-sand">{result.total} reservation{result.total === 1 ? "" : "s"} {isValidDate(filters.date) ? "" : "from today onward "}matching.</p>
      <div className="mt-4">
        <ReservationList reservations={result.items} role={user.role} showDate emptyMessage="No reservations match these filters." />
      </div>

      {result.pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm text-sand">
          {result.page > 1 ? <Link className="underline" href={pageHref(result.page - 1)}>← Previous page</Link> : <span />}
          <span>Page {result.page} of {result.pageCount}</span>
          {result.page < result.pageCount ? <Link className="underline" href={pageHref(result.page + 1)}>Next page →</Link> : <span />}
        </nav>
      )}
    </InternalShell>
  );
}
