// Single source of truth for business info. ALL values are fictional demo data.
const address = { street: "742 Hearthstone Way", district: "Culinary Arts District" };

export const restaurant = {
  name: "Ember & Spice",
  tagline: "Crafted with Fire, Served with Flavor",
  description:
    "A dining room built around a wood-fired hearth, bold spice, and unhurried hospitality.",
  footerDescription:
    "Live-fire cooking, toasted spices, and slow hospitality in the Culinary Arts District.",
  phone: { display: "+1 (555) 382-3774", tel: "+15553823774" },
  whatsapp: "15553823774", // international format, digits only
  email: "hello@emberandspice.com",
  address,
  addressLine: `${address.street}, ${address.district}`,
  directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address.street}, ${address.district}`
  )}`,
  hours: [
    { label: "Dinner Service", days: "Tuesday – Sunday", time: "5:30 PM – 11:00 PM" },
    { label: "Hearth Bar & Lounge", days: "Tuesday – Sunday", time: "5:00 PM – 1:00 AM" },
    { label: "Monday", days: "", time: "Closed" },
  ],
  // JSON-LD only. Keep in sync with `hours`.
  structuredHours: [
    {
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "17:30",
      closes: "23:00",
    },
  ],
  social: [], // e.g. [{ label: "Instagram", href: "https://instagram.com/yourhandle" }]
  copyrightName: "Ember & Spice",
};
