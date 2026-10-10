import { restaurant } from "@/config/restaurant";
import { cn } from "@/lib/utils";

export default function OpeningHours({ className }) {
  return (
    <dl className={cn("space-y-4", className)}>
      {restaurant.hours.map((h) => (
        <div key={h.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <dt>
            <span className="block font-display text-xl">{h.label}</span>
            {h.days && <span className="text-sm text-sand">{h.days}</span>}
          </dt>
          <dd className="text-sm font-semibold">{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}
