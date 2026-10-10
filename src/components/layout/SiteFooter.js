import Link from "next/link";
import { navigation } from "@/config/navigation";
import { restaurant } from "@/config/restaurant";
import Container from "@/components/ui/Container";

const h = "mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sand";
const link = "text-base text-sand transition-colors hover:text-ivory";

export default function SiteFooter() {
  return (
    <footer className="border-t border-ivory/10 bg-ember-black py-16 lg:py-20">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="font-display text-2xl">{restaurant.name}</p>
            <p className="mt-2 font-display text-lg italic text-copper-soft">{restaurant.tagline}</p>
            <p className="mt-4 text-base leading-7 text-sand">{restaurant.footerDescription}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className={h}>Navigation</h2>
            <ul className="space-y-3">
              {navigation.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className={link}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={h}>Hours</h2>
            <ul className="space-y-3 text-base text-sand">
              {restaurant.hours.map((x) => (
                <li key={x.label}>
                  <span className="block font-semibold text-ivory">{x.label}</span>
                  {x.days ? `${x.days}, ` : ""}{x.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={h}>Visit &amp; Contact</h2>
            <address className="space-y-3 text-base not-italic text-sand">
              <p>{restaurant.address.street}<br />{restaurant.address.district}</p>
              <p><a className={link} href={`tel:${restaurant.phone.tel}`}>{restaurant.phone.display}</a></p>
              <p><a className={link} href={`mailto:${restaurant.email}`}>{restaurant.email}</a></p>
              <p><a className={link} href={restaurant.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions</a></p>
            </address>
            {restaurant.social.length > 0 && (
              <ul className="mt-4 flex gap-4">
                {restaurant.social.map((s) => (
                  <li key={s.href}>
                    <a className={link} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-16 border-t border-ivory/10 pt-8 text-sm text-sand">
          © {new Date().getFullYear()} {restaurant.copyrightName}. Demo restaurant; all details are fictional.
        </p>
      </Container>
    </footer>
  );
}
