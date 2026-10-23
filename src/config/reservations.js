import { restaurant } from "./restaurant.js";

// ---------------------------------------------------------------------------
// Reservation rules. Everything business-specific lives here, nowhere else.
//
// Opening days/hours are derived from `restaurant.structuredHours` so there is
// one source of truth. The remaining numbers are STARTING DEFAULTS chosen so
// the system works out of the box. They are not facts about any real
// restaurant: review each one before going live.
// ---------------------------------------------------------------------------

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildOpeningHours() {
  const byWeekday = {}; // 0 (Sunday) .. 6 (Saturday); a missing key means closed
  for (const block of restaurant.structuredHours) {
    for (const dayName of block.dayOfWeek) {
      byWeekday[WEEKDAYS.indexOf(dayName)] = { opens: block.opens, closes: block.closes };
    }
  }
  return byWeekday;
}

export const reservationConfig = {
  // Opening hours and "today" are evaluated in this timezone.
  timezone: process.env.RESTAURANT_TIMEZONE || "America/New_York",
  openingHours: buildOpeningHours(),

  slotMinutes: 30, // spacing between bookable start times
  diningMinutes: 90, // how long a booking occupies seats
  lastSeatingBeforeCloseMinutes: 90, // last start time = closing time minus this
  seatCapacity: 40, // total seats available at any moment

  minPartySize: 1,
  maxPartySize: 8,
  minLeadMinutes: 60, // earliest bookable time is "now" + this
  maxAdvanceDays: 60,
  maxActiveReservationsPerEmail: 3, // upcoming, non-cancelled bookings per email
};
