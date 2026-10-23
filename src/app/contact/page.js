import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { restaurant } from "@/config/restaurant";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactCard from "@/components/ui/ContactCard";
import OpeningHours from "@/components/ui/OpeningHours";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Contact",
  description: `Call, message, or email ${restaurant.name}, or get directions to the restaurant.`,
};

export default function ContactPage() {
  return (
    <>
      <Section className="pb-8 lg:pb-12">
        <Reveal>
          <SectionHeading as="h1" eyebrow="Contact" title="Get in Touch"
            description="Questions about a visit, the menu, or dietary needs? Reach us whichever way is easiest." />
        </Reveal>
      </Section>

      <Section className="pt-8 lg:pt-12">
        <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal delay={0.05} className="h-full"><ContactCard icon={Phone} label="Call Us" value={restaurant.phone.display} description="Speak with the team directly." actionLabel="Call Now" href={`tel:${restaurant.phone.tel}`} variant="primary" /></Reveal>
          <Reveal delay={0.1} className="h-full"><ContactCard icon={MessageCircle} label="WhatsApp" value="Message Us" description="Send a message and we will reply when we can." actionLabel="Chat on WhatsApp" href={`https://wa.me/${restaurant.whatsapp}`} /></Reveal>
          <Reveal delay={0.15} className="h-full"><ContactCard icon={Mail} label="Email" value={restaurant.email} description="For general questions and enquiries." actionLabel="Email Us" href={`mailto:${restaurant.email}`} /></Reveal>
          <Reveal delay={0.2} className="h-full"><ContactCard icon={MapPin} label="Visit Us" value={restaurant.address.street} description={restaurant.address.district} actionLabel="Get Directions" href={restaurant.directionsUrl} /></Reveal>
        </div>
      </Section>

      <Section className="bg-ember-charcoal">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-2">
            <SectionHeading title="Opening Hours" description="We are closed on Mondays." />
            <OpeningHours />
          </div>
        </Reveal>
      </Section>
    </>
  );
}