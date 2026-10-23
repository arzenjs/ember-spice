import { restaurant } from "@/config/restaurant";
import { reservationConfig as config } from "@/config/reservations";
import { lastBookableDate } from "@/lib/availability";
import { zonedNow } from "@/lib/time";
import ReservationForm from "@/components/reserve/ReservationForm";
import OpeningHours from "@/components/ui/OpeningHours";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Reserve a Table",
  description: `Book a table at ${restaurant.name}. Choose a date, time and party size and receive instant confirmation.`,
};
export const dynamic = "force-dynamic"; // "today" must be evaluated per request

export default function ReservePage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow="Reservations"
            title="Reserve a Table"
            description="Choose your date, party size and time. Your table is confirmed instantly and a confirmation is sent to your email."
          />
          <div className="mt-10 rounded-xl bg-ember-charcoal p-6 sm:p-8">
            <ReservationForm
              minDate={zonedNow(config.timezone).date}
              maxDate={lastBookableDate(config)}
              minParty={config.minPartySize}
              maxParty={config.maxPartySize}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="self-start">
          <h2 className="font-display text-2xl">Opening Hours</h2>
          <OpeningHours className="mt-6" />
          <p className="mt-8 text-sm leading-6 text-sand">
            Parties larger than {config.maxPartySize}, or special arrangements? Please call us on{" "}
            <a className="text-ivory underline-offset-4 hover:underline" href={`tel:${restaurant.phone.tel}`}>
              {restaurant.phone.display}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
