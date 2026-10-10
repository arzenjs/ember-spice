export const cn = (...c) => c.filter(Boolean).join(" ");
export const formatPrice = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);
