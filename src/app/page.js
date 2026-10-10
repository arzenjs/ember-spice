import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/config/restaurant";
import { menuCategories } from "@/data/menu";
import { getImage } from "@/data/gallery";
import { formatPrice } from "@/lib/utils";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PhotoFrame from "@/components/ui/PhotoFrame";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import VisitStrip from "@/components/home/VisitStrip";

export const metadata = { title: { absolute: `${restaurant.name} | ${restaurant.tagline}` } };

const featured = menuCategories.flatMap((c) => c.items).filter((i) => i.featured);
const preview = ["dining-room", "spices", "cocktail", "counter"].map(getImage);

export default function HomePage() {
  const hero = getImage("hearth");
  return (
    <>
      <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden bg-ember-charcoal">
        <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ember-black via-ember-black/50 to-ember-black/20" />
        <Container className="pb-16 pt-32 lg:pb-24">
          <Reveal className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-copper-soft">Live-fire dining</p>
            <h1 className="font-display text-[40px] leading-[1.1] sm:text-5xl lg:text-[60px]">{restaurant.name}</h1>
            <p className="mt-3 font-display text-2xl italic text-sand">{restaurant.tagline}</p>
            <p className="mt-5 max-w-xl text-base leading-7 text-ivory/90">{restaurant.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/menu">View Menu</Button>
              <Button href="/location" variant="secondary">Visit Us</Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section>
        <SectionHeading
          eyebrow="Featured"
          title="From the fire"
          description="A few dishes that show how we cook. The full menu is one tap away."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {featured.map((d, i) => (
            <Reveal key={d.name} delay={i * 0.08}>
              <PhotoFrame imageId={d.imageId} ratio="aspect-[4/5]" sizes="(min-width: 768px) 33vw, 100vw" />
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl">{d.name}</h3>
                <span className="text-sm font-semibold">{formatPrice(d.price)}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-sand">{d.description}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-12"><Button href="/menu" variant="secondary">See Full Menu</Button></div>
      </Section>

      <Section className="bg-ember-charcoal">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Our approach"
              title="Fire, flavor, and craft"
              description="Everything starts at the hearth. Wood and charcoal set the pace, spices are toasted and ground in-house, and the menu stays focused on food that tastes best cooked over flame."
            />
            <div className="mt-8"><Button href="/about" variant="secondary">Our Story</Button></div>
          </Reveal>
          <PhotoFrame imageId="counter" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </Section>

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Gallery" title="Inside Ember & Spice" />
          <Link href="/gallery" className="text-xs font-semibold uppercase tracking-[0.12em] text-copper-soft hover:text-ivory">
            View all photos
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {preview.map((p) => (
            <PhotoFrame key={p.id} imageId={p.id} ratio="aspect-square" sizes="(min-width: 1024px) 25vw, 50vw" />
          ))}
        </div>
      </Section>

      <VisitStrip />

      <Section className="text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl sm:text-4xl lg:text-[40px]">
          Questions before you visit?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sand">Call, message us on WhatsApp, or send an email.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/contact">Contact Us</Button>
          <Button href={`tel:${restaurant.phone.tel}`} variant="secondary">Call Now</Button>
        </div>
      </Section>
    </>
  );
}
