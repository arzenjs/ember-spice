"use client";
import { useActionState } from "react";
import { reservationAction } from "@/app/staff/reservation-actions";
import { ACTION_LABELS } from "@/lib/status";
import { buttonStyles } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const compact = "!min-h-9 !px-3 !py-1.5";
const CONFIRM = { cancelled: "Cancel this reservation?", no_show: "Record this guest as a no-show?" };

// Buttons for one reservation row. `actions` is the list of statuses this user may move it to.
export default function ReservationActions({ id, actions, table, canAssignTable, canResendEmail, emailStatus }) {
  const [state, formAction, pending] = useActionState(reservationAction, null);

  return (
    <div className="space-y-3">
      {actions.length > 0 && (
        <form action={formAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="intent" value="status" />
          {actions.map((to) => (
            <button
              key={to}
              name="to"
              value={to}
              disabled={pending}
              onClick={(e) => CONFIRM[to] && !window.confirm(CONFIRM[to]) && e.preventDefault()}
              className={cn(
                buttonStyles(to === "arrived" || to === "seated" ? "primary" : "secondary", compact),
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {ACTION_LABELS[to]}
            </button>
          ))}
        </form>
      )}

      {canAssignTable && (
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="intent" value="table" />
          <label htmlFor={`table-${id}`} className="sr-only">Table</label>
          <input id={`table-${id}`} name="table" defaultValue={table} maxLength={20} placeholder="Table"
            className={cn(inputClass, "!min-h-9 w-28 !py-1.5 text-sm")} />
          <button disabled={pending} className={cn(buttonStyles("secondary", compact), "disabled:opacity-60")}>Save</button>
        </form>
      )}

      {canResendEmail && emailStatus !== "sent" && (
        <form action={formAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="intent" value="email" />
          <button disabled={pending} className={cn(buttonStyles("secondary", compact), "disabled:opacity-60")}>
            Resend confirmation email
          </button>
        </form>
      )}

      <p role="status" aria-live="polite" className={cn("text-sm", state?.ok ? "text-emerald-300" : "text-red-300")}>
        {state?.message}
      </p>
    </div>
  );
}
