import SlotCapacity from "../models/SlotCapacity.js";

// Atomically claim `seats` in one slot. Returns false if it would exceed `capacity`.
async function claimSlot(date, slot, seats, capacity) {
  const hasRoom = { date, slot, seatsBooked: { $lte: capacity - seats } };
  const claim = { $inc: { seatsBooked: seats } };

  if (await SlotCapacity.findOneAndUpdate(hasRoom, claim)) return true;

  // No counter yet (or it is full). Try to create it; the unique index makes concurrent creators collide.
  try {
    await SlotCapacity.create({ date, slot, seatsBooked: seats });
    return true;
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  // Someone else created it first (or it exists and is full): one more conditional attempt decides.
  return Boolean(await SlotCapacity.findOneAndUpdate(hasRoom, claim));
}

export async function releaseSeats(date, slots, seats) {
  if (!slots.length) return;
  await SlotCapacity.updateMany({ date, slot: { $in: slots } }, { $inc: { seatsBooked: -seats } });
}

// Claim seats in every slot a booking overlaps. All-or-nothing: on failure, anything claimed is returned.
export async function reserveSeats(date, slots, seats, capacity) {
  if (seats > capacity) return false;
  const claimed = [];
  try {
    for (const slot of slots) {
      if (!(await claimSlot(date, slot, seats, capacity))) {
        await releaseSeats(date, claimed, seats);
        return false;
      }
      claimed.push(slot);
    }
    return true;
  } catch (err) {
    await releaseSeats(date, claimed, seats).catch(() => {});
    throw err;
  }
}

export async function getBookedSeatsByDate(date) {
  const docs = await SlotCapacity.find({ date }).lean();
  return new Map(docs.map((d) => [d.slot, d.seatsBooked]));
}
