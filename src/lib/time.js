// Date/time helpers. Dates are "YYYY-MM-DD" strings and times are "HH:mm" strings,
// always interpreted in the restaurant's timezone. No Date objects cross module boundaries.

const pad = (n) => String(n).padStart(2, "0");

export function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  const real = dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  return real ? dt : null;
}

export const isValidDate = (s) => parseDate(s) !== null;
export const weekdayOf = (s) => parseDate(s).getUTCDay();
const toDateString = (dt) => dt.toISOString().slice(0, 10);

export function addDays(s, n) {
  const dt = parseDate(s);
  dt.setUTCDate(dt.getUTCDate() + n);
  return toDateString(dt);
}

export function daysBetween(from, to) {
  return Math.round((parseDate(to) - parseDate(from)) / 86_400_000);
}

export function timeToMinutes(t) {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(t));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export const minutesToTime = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

// Current calendar date and minutes-since-midnight in the given IANA timezone.
export function zonedNow(timeZone, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function formatDateLong(s) {
  return parseDate(s).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatTime12(t) {
  const mins = timeToMinutes(t);
  const h = Math.floor(mins / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(mins % 60)} ${h < 12 ? "AM" : "PM"}`;
}
