import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Section className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-soft">404</p>
      <h1 className="mt-3 font-display text-4xl">This page has gone up in smoke.</h1>
      <p className="mx-auto mt-4 max-w-md text-sand">The page you are looking for does not exist.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/">Back Home</Button>
        <Button href="/menu" variant="secondary">View Menu</Button>
      </div>
    </Section>
  );
}
