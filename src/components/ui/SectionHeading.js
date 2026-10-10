import { cn } from "@/lib/utils";

export default function SectionHeading({ eyebrow, title, description, as: Tag = "h2", className }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-copper-soft">{eyebrow}</p>
      )}
      <Tag className="font-display text-3xl leading-tight sm:text-4xl lg:text-[40px] lg:leading-[1.15]">{title}</Tag>
      {description && <p className="mt-4 text-base leading-7 text-sand">{description}</p>}
    </div>
  );
}
