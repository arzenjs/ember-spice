export const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// j***@example.com: lets a guest recognise the address without exposing it fully.
export function maskEmail(email) {
  const [local, domain] = String(email).split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}
