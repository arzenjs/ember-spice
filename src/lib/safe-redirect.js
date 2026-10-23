// Open-redirect protection: only same-site relative paths that the role may visit are honoured.
const HOME = { admin: "/admin", staff: "/staff/dashboard" };
const ALLOWED_PREFIXES = { admin: ["/admin", "/staff/dashboard"], staff: ["/staff/dashboard"] };

export function safeInternalPath(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, "http://internal.invalid");
    if (url.origin !== "http://internal.invalid") return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export const homePathForRole = (role) => HOME[role] ?? "/staff/login";

export function resolvePostLoginPath(role, next) {
  const safe = safeInternalPath(next);
  if (!safe || !ALLOWED_PREFIXES[role]) return homePathForRole(role);
  const pathname = safe.split("?")[0];
  const allowed = ALLOWED_PREFIXES[role].some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return allowed ? safe : homePathForRole(role);
}
