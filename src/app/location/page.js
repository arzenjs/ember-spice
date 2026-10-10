import { MapPin, Phone } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import OpeningHours from "@/components/ui/OpeningHours";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Visit Us",
  description: `Address, opening hours, and directions for ${restaurant.name}.`,
};

export default function LocationPage() {
  return (
    <>
      <Section className="pb-8 lg:pb-12">
        <SectionHeading as="h1" eyebrow="Location & Hours" title="Visit Us"
          description="Find us in the Culinary Arts District. Opening hours and directions are below." />
      </Section>

      <Section className="pt-8 lg:pt-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-ember-charcoal p-8">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sand">
              <MapPin size={18} className="text-copper-soft" aria-hidden="true" /> Address &amp; Directions
            </h2>
            <p className="mt-5 font-display text-3xl">{restaurant.address.street}</p>
            <p className="mt-1 text-base text-sand">{restaurant.address.district}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={restaurant.directionsUrl}>Get Directions</Button>
              <Button href={`tel:${restaurant.phone.tel}`} variant="secondary">
                <Phone size={16} aria-hidden="true" /> {restaurant.phone.display}
              </Button>
            </div>
          </div>

          <div className="rounded-xl bg-ember-charcoal p-8">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-sand">Opening Hours</h2>
            <OpeningHours />
          </div>
        </div>
      </Section>

      <Section className="bg-ember-charcoal text-center">
        <h2 className="font-display text-3xl lg:text-4xl">Need help finding us?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sand">Call or message us and we will point you the right way.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/contact">Contact Us</Button>
          <Button href="/menu" variant="secondary">View Menu</Button>
        </div>
      </Section>
    </>
  );
}
