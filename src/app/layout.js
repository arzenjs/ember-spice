import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteChrome from "@/components/layout/SiteChrome";
import { restaurant } from "@/config/restaurant";

const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${restaurant.name} | ${restaurant.tagline}`, template: `%s | ${restaurant.name}` },
  description: restaurant.description,
  openGraph: {
    title: restaurant.name,
    description: restaurant.description,
    siteName: restaurant.name,
    type: "website",
    locale: "en_US",
  },
};

export const viewport = { themeColor: "#171513", viewportFit: "cover" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  description: restaurant.description,
  telephone: restaurant.phone.tel,
  email: restaurant.email,
  address: { "@type": "PostalAddress", streetAddress: restaurant.address.street, addressLocality: restaurant.address.district },
  openingHoursSpecification: restaurant.structuredHours.map((h) => ({ "@type": "OpeningHoursSpecification", ...h })),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${garamond.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-ivory px-4 py-2 text-ember-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </SiteChrome>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
