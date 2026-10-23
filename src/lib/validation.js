import { dateProblem, listBookableTimes } from "./availability.js";

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const clean = (v) => String(v ?? "").replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();

export function validateName(value) {
  const name = clean(value);
  if (name.length < 2) return { error: "Please enter your full name." };
  if (name.length > 80) return { error: "Name is too long." };
  return { value: name };
}

export function validateEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  const ok = email.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/.test(email);
  return ok ? { value: email } : { error: "Please enter a valid email address." };
}

export function validatePhone(value) {
  const phone = clean(value);
  const digits = phone.replace(/\D/g, "");
  const ok = /^[+\d][\d\s().+-]*$/.test(phone) && digits.length >= 7 && digits.length <= 15 && phone.length <= 30;
  return ok ? { value: phone, digits } : { error: "Please enter a valid phone number (7-15 digits)." };
}

export function validatePassword(value, { minLength, email } = {}) {
  const password = String(value ?? "");
  if (password.length < minLength) return { error: `Password must be at least ${minLength} characters.` };
  if (Buffer.byteLength(password) > 72) return { error: "Password is too long (72 bytes maximum)." };
  if (email && password.toLowerCase() === email.toLowerCase()) return { error: "Password must not be your email address." };
  return { value: password };
}

// Validates a raw reservation submission against the config and current time.
// Returns { values } on success or { errors: { field: message } }.
export function validateReservationInput(raw, config, now = new Date()) {
  const errors = {};
  const values = {};

  const name = validateName(raw.guestName);
  name.error ? (errors.guestName = name.error) : (values.guestName = name.value);

  const email = validateEmail(raw.email);
  email.error ? (errors.email = email.error) : (values.email = email.value);

  const phone = validatePhone(raw.phone);
  if (phone.error) errors.phone = phone.error;
  else {
    values.phone = phone.value;
    values.phoneDigits = phone.digits;
  }

  const size = Number(raw.partySize);
  if (!Number.isInteger(size) || size < config.minPartySize || size > config.maxPartySize) {
    errors.partySize = `Party size must be between ${config.minPartySize} and ${config.maxPartySize}.`;
  } else values.partySize = size;

  const date = String(raw.date ?? "");
  const problem = dateProblem(date, config, now);
  if (problem) errors.date = problem;
  else values.date = date;

  if (!errors.date) {
    const time = String(raw.time ?? "");
    if (!listBookableTimes(date, config, now).includes(time)) errors.time = "Please choose one of the available times.";
    else values.time = time;
  } else if (!raw.time) errors.time = "Please choose a time.";

  return Object.keys(errors).length ? { errors } : { values };
}
