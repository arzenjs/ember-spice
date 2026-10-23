import Button from "./Button";

export default function ContactCard({ icon: Icon, label, value, description, actionLabel, href, variant = "secondary" }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl bg-ember-charcoal p-7">
      <div>
        <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-ember-black text-copper-soft" aria-hidden="true">
          <Icon size={22} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sand">{label}</p>
        <p className="mt-1 break-words font-display text-2xl">{value}</p>
        <p className="mb-7 mt-3 text-sm leading-6 text-sand">{description}</p>
      </div>
      <Button href={href} variant={variant} className="w-full">
        {actionLabel}
      </Button>
    </div>
  );
}
