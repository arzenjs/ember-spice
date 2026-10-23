import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Alert from "@/components/ui/Alert";

// Shared layout for legal pages. Content is supplied by each page.
export default function LegalPage({ title, updated, children }) {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <SectionHeading as="h1" eyebrow="Legal" title={title} />
        <Alert variant="warning" className="mt-6">
          Draft template. Have this text reviewed by a qualified professional and adapt it to the restaurant before launch.
        </Alert>
        <p className="mt-6 text-sm text-sand">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 text-base leading-7 text-sand [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ivory [&_li]:ml-5 [&_li]:list-disc [&_a]:text-ivory [&_a]:underline">
          {children}
        </div>
      </div>
    </Section>
  );
}
