"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { navigation } from "@/config/navigation";
import { restaurant } from "@/config/restaurant";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const t = { duration: reduce ? 0 : 0.2, ease: "easeOut" };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const tone = (active) => (active ? "text-ivory" : "text-sand hover:text-ivory");

  return (
    <>
      {/* No backdrop-filter here: it would become the containing block for any fixed descendant. */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ivory/10 bg-ember-black/95 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-14">
          <Link href="/" className="font-display text-2xl tracking-wide" onClick={() => setOpen(false)}>
            {restaurant.name}
          </Link>

          <nav aria-label="Primary" className="hidden h-full items-center gap-8 lg:flex">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-full items-center text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
                    tone(active)
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={t}
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-copper"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/reserve" className="hidden sm:inline-flex">
              Reserve a Table
            </Button>
            <Button href={restaurant.directionsUrl} variant="secondary" className="hidden xl:inline-flex">
              Get Directions
            </Button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={t}
            className="fixed inset-x-0 bottom-0 top-[calc(5rem+env(safe-area-inset-top))] z-40 overflow-y-auto bg-ember-black px-5 pb-[env(safe-area-inset-bottom)] sm:px-8 lg:hidden"
          >
            <nav aria-label="Mobile">
              <ul className="py-4">
                {navigation.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href} className="border-b border-ivory/10">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn("flex min-h-14 items-center font-display text-3xl transition-colors duration-200", tone(active))}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex flex-col gap-3 py-6">
              <Button href="/reserve" onClick={() => setOpen(false)}>
                Reserve a Table
              </Button>
              <Button href={`tel:${restaurant.phone.tel}`} variant="secondary">
                <Phone size={16} aria-hidden="true" /> Call Now
              </Button>
              <Button href={restaurant.directionsUrl} variant="secondary">
                Get Directions
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
