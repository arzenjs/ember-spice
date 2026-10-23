import { cn } from "@/lib/utils";

const styles = {
  error: "border-red-400/50 bg-red-950/40 text-red-100",
  success: "border-emerald-400/40 bg-emerald-950/40 text-emerald-100",
  warning: "border-copper-soft/50 bg-terracotta/20 text-ivory",
  info: "border-sand/30 bg-ember-charcoal text-sand",
};

export default function Alert({ variant = "info", className, children }) {
  const role = variant === "error" || variant === "warning" ? "alert" : "status";
  return <div role={role} className={cn("rounded-lg border px-4 py-3 text-sm leading-6", styles[variant], className)}>{children}</div>;
}
