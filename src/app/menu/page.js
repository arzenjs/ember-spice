import { restaurant } from "@/config/restaurant";
import { menuCategories } from "@/data/menu";
import { formatPrice } from "@/lib/utils";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Menu",
  description: `Browse the ${restaurant.name} menu: dishes from the hearth, small plates, desserts, and drinks.`,
};

export default function MenuPage() {
  return (
    <>
      <Section className="pb-8 lg:pb-10">
        <SectionHeading as="h1" eyebrow="Menu" title="From the hearth to the table"
          description="Menu and prices are subject to change. Please ask your server about ingredients and dietary needs." />
      </Section>

      <div className="sticky top-20 z-30 border-y border-ivory/10 bg-ember-black/95 backdrop-blur">
        <Container>
          <nav aria-label="Menu categories">
            <ul className="-mx-2 flex gap-1 overflow-x-auto py-2">
              {menuCategories.map((c) => (
                <li key={c.id} className="shrink-0">
                  <a href={`#${c.id}`} className="flex min-h-11 items-center rounded-lg px-4 text-xs font-semibold uppercase tracking-[0.12em] text-sand hover:text-ivory">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container className="py-12 lg:py-16">
        {menuCategories.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-40 pb-14 last:pb-0">
            <h2 id={`${c.id}-title`} className="font-display text-3xl lg:text-4xl">{c.title}</h2>
            <p className="mt-2 text-sand">{c.intro}</p>
            <ul className="mt-8 divide-y divide-ivory/10 border-y border-ivory/10">
              {c.items.map((i) => (
                <li key={i.name} className="flex items-baseline justify-between gap-6 py-5">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl">{i.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-sand">{i.description}</p>
                  </div>
                  <span className="shrink-0 text-base font-semibold">{formatPrice(i.price)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>

      <Section className="bg-ember-charcoal text-center">
        <h2 className="font-display text-3xl lg:text-4xl">Questions about the menu?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sand">Get in touch and we will be glad to help.</p>
        <div className="mt-8 flex justify-center"><Button href="/contact">Contact Us</Button></div>
      </Section>
    </>
  );
}
