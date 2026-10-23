import { headers } from "next/headers";

// Best-effort client IP. On Vercel, x-forwarded-for is set by the platform and its first entry is the client.
// When self-hosting, make sure your reverse proxy overwrites this header, or limits can be evaded.
export async function getClientIp() {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    return (forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip")) || "unknown";
  } catch {
    return "unknown";
  }
}
