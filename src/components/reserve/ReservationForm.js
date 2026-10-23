"use client";
import { useActionState, useRef, useState } from "react";
import { createReservationAction, getSlotsAction } from "@/app/reserve/actions";
import Alert from "@/components/ui/Alert";
import { SelectField, TextField } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { cn } from "@/lib/utils";

const EMPTY_SLOTS = { status: "idle", items: [], message: "" };

export default function ReservationForm({ minDate, maxDate, minParty, maxParty }) {
  const [values, setValues] = useState({ guestName: "", email: "", phone: "", date: "", partySize: "2", time: "" });
  const [slots, setSlots] = useState(EMPTY_SLOTS);
  const latestLookup = useRef(0);

  const [state, formAction] = useActionState(async (prev, formData) => {
    const result = await createReservationAction(prev, formData);
    // Lost a race for the last table? Show what is still available and clear the stale choice.
    if (result?.slots) {
      setSlots({ status: "ready", items: result.slots, message: "" });
      setValues((v) => ({ ...v, time: "" }));
    }
    return result;
  }, {});

  async function loadSlots(date, partySize) {
    if (!date || !partySize) return setSlots(EMPTY_SLOTS);
    const lookup = ++latestLookup.current;
    setSlots({ status: "loading", items: [], message: "" });
    const res = await getSlotsAction(date, partySize);
    if (lookup !== latestLookup.current) return; // a newer lookup superseded this one
    setSlots({ status: res.ok ? "ready" : "error", items: res.slots, message: res.message });
    setValues((v) => (res.slots.some((s) => s.time === v.time && s.available) ? v : { ...v, time: "" }));
  }

  const onText = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const onSlotInput = (key) => (e) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    loadSlots(next.date, next.partySize);
  };

  const errors = state?.errors ?? {};
  const partyOptions = Array.from({ length: maxParty - minParty + 1 }, (_, i) => minParty + i);
  const anyAvailable = slots.items.some((s) => s.available);

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state?.message && <Alert variant="error">{state.message}</Alert>}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Full name" name="guestName" autoComplete="name" required maxLength={80}
          value={values.guestName} onChange={onText("guestName")} error={errors.guestName} />
        <TextField label="Phone number" name="phone" type="tel" autoComplete="tel" required maxLength={30}
          value={values.phone} onChange={onText("phone")} error={errors.phone} />
      </div>
      <TextField label="Email address" name="email" type="email" autoComplete="email" required maxLength={254}
        value={values.email} onChange={onText("email")} error={errors.email}
        hint="Your confirmation will be sent here." />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Date" name="date" type="date" required min={minDate} max={maxDate}
          value={values.date} onChange={onSlotInput("date")} error={errors.date} />
        <SelectField label="Guests" name="partySize" required value={values.partySize}
          onChange={onSlotInput("partySize")} error={errors.partySize}>
          {partyOptions.map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
          ))}
        </SelectField>
      </div>

      <fieldset aria-describedby="time-status">
        <legend className="mb-3 block text-xs font-semibold uppercase tracking-[0.12em] text-sand">Time</legend>
        <div id="time-status" aria-live="polite" className="text-sm text-sand">
          {slots.status === "idle" && <p>Choose a date to see available times.</p>}
          {slots.status === "loading" && <p>Checking availability…</p>}
          {slots.message && <p>{slots.message}</p>}
          {slots.status === "ready" && anyAvailable === false && slots.items.length > 0 && (
            <p>Every time on this day is fully booked for your party size. Please try another date.</p>
          )}
        </div>
        {slots.items.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {slots.items.map((slot) => (
              <label key={slot.time} className="relative">
                <input type="radio" name="time" value={slot.time} className="peer sr-only"
                  disabled={!slot.available} checked={values.time === slot.time} onChange={onText("time")} />
                <span className={cn(
                  "flex min-h-11 items-center justify-center rounded-lg border border-sand/30 px-2 text-sm transition-colors",
                  "peer-checked:border-copper peer-checked:bg-terracotta peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-copper-soft",
                  slot.available ? "cursor-pointer hover:border-ivory" : "cursor-not-allowed opacity-40 line-through"
                )}>
                  {slot.label}
                </span>
              </label>
            ))}
          </div>
        )}
        {errors.time && <p className="mt-2 text-sm text-red-300">{errors.time}</p>}
      </fieldset>

      <SubmitButton pendingLabel="Reserving…" className="w-full sm:w-auto" disabled={!values.time}>
        Confirm Reservation
      </SubmitButton>
    </form>
  );
}
