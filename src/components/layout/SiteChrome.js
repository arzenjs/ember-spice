"use client";
import { usePathname } from "next/navigation";

// Staff and admin screens have their own chrome, so the public header and footer are hidden there.
const INTERNAL_PREFIXES = ["/admin", "/staff"];

export default function SiteChrome({ header, footer, children }) {
  const pathname = usePathname();
  const internal = INTERNAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (internal) return <main id="main">{children}</main>;
  return (
    <>
      {header}
      <main id="main" className="pt-20">{children}</main>
      {footer}
    </>
  );
}
