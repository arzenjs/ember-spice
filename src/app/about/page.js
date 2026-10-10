import { restaurant } from "@/config/restaurant";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import PhotoFrame from "@/components/ui/PhotoFrame";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "About",
  description: `The story and cooking approach behind ${restaurant.name}: live fire, toasted spices, and simple hospitality.`,
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-8 lg:pb-12">
        <SectionHeading as="h1" eyebrow="About" title="Our Story"
          description="Ember & Spice began with one idea: the best flavor comes from fire, patience, and well-handled spice." />
      </Section>

      <Section className="pt-8 lg:pt-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <PhotoFrame imageId="hearth" sizes="(min-width: 1024px) 50vw, 100vw" />
          <Reveal>
            <h2 className="font-display text-3xl lg:text-[40px]">Our Approach</h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-sand">
              <p>Our kitchen is organized around an open wood-fired hearth. Wood and charcoal give each dish its character, from the first sear to the final rest.</p>
              <p>We keep the menu focused. Fewer dishes, cooked with attention, and seasoned with spices we toast and grind ourselves.</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-ember-charcoal">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <h2 className="font-display text-3xl lg:text-[40px]">Fire, Flavor, and Craft</h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-sand">
              <p>Spice is how we layer flavor. Whole seeds and pods are toasted, ground, and balanced against smoke, acidity, and salt.</p>
              <p>The dining room is warm and unhurried, with the hearth always in view. Sit at the counter to watch, or at a table to settle in.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/menu">View Menu</Button>
              <Button href="/location" variant="secondary">Visit Us</Button>
            </div>
          </Reveal>
          <PhotoFrame imageId="spices" className="lg:order-1" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </Section>
    </>
  );
}
