import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImage } from "@/data/gallery";

// Fixed-ratio image frame. The charcoal background holds the layout if a photo file is missing.
export default function PhotoFrame({ imageId, ratio = "aspect-[4/3]", sizes, priority = false, className }) {
  const img = getImage(imageId);
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-ember-charcoal", ratio, className)}>
      <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
