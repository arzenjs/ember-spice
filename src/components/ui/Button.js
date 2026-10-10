import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors";
const variants = {
  primary: "bg-terracotta text-ivory hover:bg-copper hover:text-ember-black",
  secondary: "border border-sand/40 text-ivory hover:border-ivory hover:bg-ivory/10",
};

export default function Button({ href, variant = "primary", className, children, ...props }) {
  const cls = cn(base, variants[variant], className);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={cls}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
