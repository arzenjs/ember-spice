import { addDays, daysBetween, isValidDate, minutesToTime, timeToMinutes, weekdayOf, zonedNow } from "./time.js";

// Pure rules: which start times may be offered on a date, ignoring how full the room is.
// Capacity is applied separately by the server (see src/server/capacity.js).

export function getOpeningWindow(date, config) {
  const hours = config.openingHours[weekdayOf(date)];
  if (!hours) return null;
  return { opens: timeToMinutes(hours.opens), closes: timeToMinutes(hours.closes) };
}

// Why a date cannot be booked at all, or null when it can. Used for friendly messages.
export function dateProblem(date, config, now = new Date()) {
  if (!isValidDate(date)) return "Please choose a valid date.";
  const today = zonedNow(config.timezone, now).date;
  if (date < today) return "Please choose today or a future date.";
  if (daysBetween(today, date) > config.maxAdvanceDays) {
    return `Reservations can be made up to ${config.maxAdvanceDays} days ahead.`;
  }
  if (!getOpeningWindow(date, config)) return "We are closed on that day. Please choose another date.";
  return null;
}

// Start times ("HH:mm") that satisfy opening hours, last seating and lead time.
export function listBookableTimes(date, config, now = new Date()) {
  if (dateProblem(date, config, now)) return [];
  const { opens, closes } = getOpeningWindow(date, config);
  const lastStart = closes - config.lastSeatingBeforeCloseMinutes;
  const local = zonedNow(config.timezone, now);
  const earliest = date === local.date ? local.minutes + config.minLeadMinutes : 0;

  const times = [];
  for (let m = opens; m <= lastStart; m += config.slotMinutes) {
    if (m >= earliest) times.push(minutesToTime(m));
  }
  return times;
}

// Capacity counters are kept per slot. A booking holds seats in every slot it overlaps.
export function coveredSlots(startMinutes, config) {
  const count = Math.ceil(config.diningMinutes / config.slotMinutes);
  return Array.from({ length: count }, (_, i) => startMinutes + i * config.slotMinutes);
}

export const lastBookableDate = (config, now = new Date()) =>
  addDays(zonedNow(config.timezone, now).date, config.maxAdvanceDays);
