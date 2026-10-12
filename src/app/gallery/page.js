import { restaurant } from "@/config/restaurant";
import { galleryItems, galleryCategories } from "@/data/gallery";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Gallery",
  description: `Photos of the hearth, the dishes, and the dining room at ${restaurant.name}[cite: 3].`,
};

export default function GalleryPage() {
  return (
    <Section>
      <Reveal>
        <SectionHeading as="h1" eyebrow="Gallery" title="The Gallery"
          description="The hearth, the plates, and the room: a look inside Ember & Spice." />
      </Reveal>
      <Reveal delay={0.15}>
        <div className="mt-10">
          <GalleryGrid items={galleryItems} categories={galleryCategories} />
        </div>
      </Reveal>
    </Section>
  );
}