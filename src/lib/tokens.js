import { createHash, randomBytes, randomInt } from "node:crypto";

// Unambiguous characters only (no 0/O, 1/I/L) so references are easy to read out at reception.
const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// 256-bit random token, URL-safe. Only its SHA-256 hash is ever stored.
export const generateToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");
// Cheap shape check so junk values never reach the database.
export const looksLikeToken = (t) => typeof t === "string" && /^[A-Za-z0-9_-]{43}$/.test(t);

// Human-friendly reference such as ES-7K3M-9QX2 (~40 bits). Uniqueness is enforced by a DB index.
export function generateReference() {
  const chars = Array.from({ length: 8 }, () => REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)]).join("");
  return `ES-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

// Accepts "es-7k3m-9qx2", "ES7K3M9QX2", etc. Returns the canonical form or null.
export function normalizeReference(input) {
  const compact = String(input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = compact.startsWith("ES") ? compact.slice(2) : compact;
  return /^[A-Z0-9]{8}$/.test(body) ? `ES-${body.slice(0, 4)}-${body.slice(4)}` : null;
}
