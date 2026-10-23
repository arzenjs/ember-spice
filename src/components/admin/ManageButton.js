"use client";
import { useActionState } from "react";
import { manageStaffAction } from "@/app/admin/staff/actions";
import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// One small button that runs a staff/invitation management action and reports the outcome inline.
export default function ManageButton({ id, intent, label, confirm }) {
  const [state, formAction, pending] = useActionState(manageStaffAction, null);
  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value={intent} />
      <button
        disabled={pending}
        onClick={(e) => confirm && !window.confirm(confirm) && e.preventDefault()}
        className={cn(buttonStyles("secondary", "!min-h-9 !px-3 !py-1.5"), "disabled:cursor-not-allowed disabled:opacity-60")}
      >
        {pending ? "Working…" : label}
      </button>
      {state?.message && <span role="status" className={cn("text-xs", state.ok ? "text-emerald-300" : "text-red-300")}>{state.message}</span>}
    </form>
  );
}
