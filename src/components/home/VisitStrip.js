import { MapPin } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import OpeningHours from "@/components/ui/OpeningHours";
import Button from "@/components/ui/Button";

export default function VisitStrip() {
  return (
    <Section className="bg-ember-charcoal">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Visit" title="Find us at the hearth" />
          <p className="mt-6 flex items-start gap-3 text-base text-sand">
            <MapPin size={20} className="mt-0.5 shrink-0 text-copper-soft" aria-hidden="true" />
            <span>{restaurant.address.street}<br />{restaurant.address.district}</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={restaurant.directionsUrl}>Get Directions</Button>
            <Button href="/location" variant="secondary">Visit Details</Button>
          </div>
        </div>
        <OpeningHours />
      </div>
    </Section>
  );
}
