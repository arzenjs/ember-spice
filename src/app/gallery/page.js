import { restaurant } from "@/config/restaurant";
import { galleryItems, galleryCategories } from "@/data/gallery";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Gallery",
  description: `Photos of the hearth, the dishes, and the dining room at ${restaurant.name}.`,
};

export default function GalleryPage() {
  return (
    <Section>
      <SectionHeading as="h1" eyebrow="Gallery" title="The Gallery"
        description="The hearth, the plates, and the room: a look inside Ember & Spice." />
      <div className="mt-10">
        <GalleryGrid items={galleryItems} categories={galleryCategories} />
      </div>
    </Section>
  );
}
