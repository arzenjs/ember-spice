import { STATUS_LABELS } from "@/lib/status";
import { cn } from "@/lib/utils";

const tone = {
  confirmed: "bg-sand/15 text-sand",
  arrived: "bg-copper/25 text-copper-soft",
  seated: "bg-emerald-900/50 text-emerald-200",
  cancelled: "bg-ivory/10 text-sand",
  no_show: "bg-red-900/50 text-red-200",
  // invitation / account states
  pending: "bg-sand/15 text-sand",
  accepted: "bg-emerald-900/50 text-emerald-200",
  expired: "bg-ivory/10 text-sand",
  revoked: "bg-red-900/50 text-red-200",
  active: "bg-emerald-900/50 text-emerald-200",
  disabled: "bg-red-900/50 text-red-200",
};

const label = (s) => STATUS_LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1);

export default function StatusBadge({ status, className }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]", tone[status], className)}>
      {label(status)}
    </span>
  );
}
