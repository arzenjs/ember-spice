// Public base URL used to build links in emails. No trailing slash.
export function getSiteUrl() {
  const url = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
