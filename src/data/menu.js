// Demo menu. Prices are placeholders. Add `imageId` (a gallery item id) to feature a dish on the home page.
export const menuCategories = [
  {
    id: "hearth",
    title: "From the Hearth",
    intro: "Cooked over live wood and charcoal.",
    items: [
      { name: "Ribeye over Charcoal", description: "Seared over white charcoal, finished with smoked salt.", price: 68, featured: true, imageId: "ribeye" },
      { name: "Charred Octopus", description: "Blistered over embers, served with romesco and herbs.", price: 29, featured: true, imageId: "octopus" },
      { name: "Ember-Roasted Cauliflower", description: "Roasted whole in the coals with toasted spice and lemon.", price: 22 },
    ],
  },
  {
    id: "small-plates",
    title: "Small Plates",
    intro: "To start, or to share.",
    items: [
      { name: "Hearth Sourdough", description: "Warm bread with smoked butter.", price: 9 },
      { name: "Charred Baby Leeks", description: "Grilled leeks with herb oil and edible flowers.", price: 16 },
      { name: "Grilled Flatbread", description: "Spiced labneh, olive oil, and za'atar.", price: 14 },
    ],
  },
  {
    id: "desserts",
    title: "Desserts",
    intro: "Something sweet to finish.",
    items: [
      { name: "Burnt Basque Cheesecake", description: "Caramelized crust, soft custard centre, smoked salt.", price: 12, featured: true, imageId: "cheesecake" },
      { name: "Smoked Honey Ice Cream", description: "Vanilla ice cream with honey warmed over the fire.", price: 10 },
    ],
  },
  {
    id: "drinks",
    title: "Drinks",
    intro: "Cocktails, wine, and non-alcoholic options.",
    items: [
      { name: "The Cinder Old Fashioned", description: "Bourbon, bitters, and wood smoke over a large ice sphere.", price: 16 },
      { name: "Wine by the Glass", description: "Ask your server for the current red and white selection.", price: 14 },
      { name: "Spiced Ginger Soda", description: "House ginger syrup, lime, and soda.", price: 7 },
    ],
  },
];
