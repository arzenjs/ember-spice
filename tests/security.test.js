import test from "node:test";
import assert from "node:assert/strict";
import { generateReference, generateToken, hashToken, looksLikeToken, normalizeReference } from "../src/lib/tokens.js";
import { resolvePostLoginPath, safeInternalPath } from "../src/lib/safe-redirect.js";
import { allowedFromStatuses, nextStatuses, canChangeStatus } from "../src/lib/status.js";
import { escapeHtml, escapeRegex, maskEmail } from "../src/lib/text.js";

test("tokens are unique, URL-safe and stored only as hashes", () => {
  const a = generateToken();
  const b = generateToken();
  assert.notEqual(a, b);
  assert.ok(looksLikeToken(a));
  assert.equal(hashToken(a).length, 64);
  assert.notEqual(hashToken(a), a);
  assert.equal(hashToken(a), hashToken(a));
  assert.ok(!looksLikeToken("short"));
  assert.ok(!looksLikeToken(`${a}!`));
  assert.ok(!looksLikeToken({ $ne: "" }));
});

test("references are readable and normalisable", () => {
  const ref = generateReference();
  assert.match(ref, /^ES-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
  assert.equal(normalizeReference(ref.toLowerCase()), ref);
  assert.equal(normalizeReference(ref.replace(/-/g, " ")), ref);
  assert.equal(normalizeReference("hello"), null);
  const seen = new Set(Array.from({ length: 2000 }, generateReference));
  assert.equal(seen.size, 2000);
});

test("open redirects are blocked", () => {
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "evil", "", null, undefined, "/ok\n/x"]) {
    assert.equal(safeInternalPath(bad), null, String(bad));
  }
  assert.equal(safeInternalPath("/admin?x=1"), "/admin?x=1");
});

test("post-login redirect depends on verified role only", () => {
  assert.equal(resolvePostLoginPath("admin", undefined), "/admin");
  assert.equal(resolvePostLoginPath("staff", undefined), "/staff/dashboard");
  assert.equal(resolvePostLoginPath("staff", "/admin"), "/staff/dashboard"); // staff cannot be sent to admin
  assert.equal(resolvePostLoginPath("admin", "/admin/staff"), "/admin/staff");
  assert.equal(resolvePostLoginPath("staff", "//evil.com"), "/staff/dashboard");
  assert.equal(resolvePostLoginPath("hacker", "/admin"), "/staff/login");
});

test("status transitions", () => {
  assert.deepEqual(nextStatuses("confirmed", "staff").sort(), ["arrived", "cancelled", "no_show"]);
  assert.deepEqual(nextStatuses("arrived", "staff").sort(), ["cancelled", "confirmed", "seated"]);
  assert.deepEqual(nextStatuses("seated", "admin"), []);
  assert.deepEqual(nextStatuses("cancelled", "admin"), []);
  assert.deepEqual(allowedFromStatuses("seated"), ["arrived"]); // cannot seat without arrival
  assert.ok(!allowedFromStatuses("arrived").includes("cancelled"));
  assert.equal(canChangeStatus("nobody", "arrived"), false);
});

test("escaping helpers", () => {
  assert.equal(escapeHtml(`<img src=x onerror="a()">&'`), "&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;");
  assert.equal(escapeRegex("a.b*c(d)"), "a\\.b\\*c\\(d\\)");
  assert.equal(maskEmail("ada@example.com"), "a***@example.com");
});
