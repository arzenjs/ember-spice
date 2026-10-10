// Replace the files in /public/images to change photography. Paths live only here.
export const galleryCategories = [
  { id: "hearth", label: "The Hearth" },
  { id: "dishes", label: "Dishes" },
  { id: "dining", label: "Dining Room" },
  { id: "cellar", label: "Bar & Cellar" },
];

export const galleryItems = [
  { id: "hearth", title: "The Hearth", caption: "The open wood-fired hearth as evening service begins.", alt: "Cook tending an open wood fire in a dark kitchen, sparks rising", category: "hearth", src: "/images/hearth.jpg" },
  { id: "ribeye", title: "Ribeye over Charcoal", caption: "A ribeye searing over glowing white charcoal.", alt: "Ribeye steak sizzling over white charcoal with small flares of flame", category: "dishes", src: "/images/ribeye.jpg" },
  { id: "dining-room", title: "The Dining Room", caption: "Candlelight, dark wood, and exposed brick.", alt: "Candlelit dining room with dark wood tables and brick walls", category: "dining", src: "/images/dining-room.jpg" },
  { id: "spices", title: "Toasted Spices", caption: "Whole spices ground by hand in a stone mortar.", alt: "Stone mortar filled with star anise, paprika, sumac, and coriander seed", category: "dishes", src: "/images/spices.jpg" },
  { id: "cocktail", title: "Smoked Old Fashioned", caption: "Bourbon, a hand-cut ice sphere, and a touch of wood smoke.", alt: "Amber bourbon cocktail with a large ice sphere under a smoke-filled glass cloche", category: "cellar", src: "/images/cocktail.jpg" },
  { id: "octopus", title: "Charred Octopus", caption: "Blistered over embers, served with romesco.", alt: "Charred octopus tentacle on a black plate with orange romesco and herbs", category: "dishes", src: "/images/octopus.jpg" },
  { id: "wine", title: "The Wine Cellar", caption: "Racks of bottles lit by warm brass spotlights.", alt: "Dim wine cellar with iron racks full of bottles", category: "cellar", src: "/images/wine-cellar.jpg" },
  { id: "counter", title: "The Chef's Counter", caption: "Seats facing the open flame.", alt: "Guests seated at a dark counter watching cooks plate courses by the fire", category: "dining", src: "/images/chefs-counter.jpg" },
  { id: "cheesecake", title: "Burnt Basque Cheesecake", caption: "A deeply caramelized crust over a soft custard centre.", alt: "Slice of burnt Basque cheesecake with a dark caramelized top", category: "dishes", src: "/images/cheesecake.jpg" },
];

export const getImage = (id) => galleryItems.find((i) => i.id === id);
