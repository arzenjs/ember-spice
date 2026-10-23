// Needs a real MongoDB. Skipped unless MONGODB_TEST_URI is set. WARNING: it wipes the SlotCapacity collection.
import test from "node:test";
import assert from "node:assert/strict";

const uri = process.env.MONGODB_TEST_URI;
const skip = uri ? false : "MONGODB_TEST_URI not set";

// Imported lazily so the file can be loaded (and skipped) without a database or installed packages.
async function load() {
  const { default: mongoose } = await import("mongoose");
  const { default: SlotCapacity } = await import("../../src/models/SlotCapacity.js");
  const { releaseSeats, reserveSeats } = await import("../../src/server/capacity.js");
  return { mongoose, SlotCapacity, releaseSeats, reserveSeats };
}

test("concurrent bookings can never exceed capacity", { skip }, async () => {
  const { mongoose, SlotCapacity, releaseSeats, reserveSeats } = await load();
  await mongoose.connect(uri);
  await SlotCapacity.init();
  await SlotCapacity.deleteMany({});
  try {
    const capacity = 40;
    const slots = [1050, 1080, 1110];
    // 30 simultaneous parties of 4 (120 seats requested) for a 40-seat room: exactly 10 may succeed.
    const results = await Promise.all(Array.from({ length: 30 }, () => reserveSeats("2026-12-01", slots, 4, capacity)));
    assert.equal(results.filter(Boolean).length, 10);
    for (const slot of slots) {
      const doc = await SlotCapacity.findOne({ date: "2026-12-01", slot });
      assert.equal(doc.seatsBooked, 40);
    }
  } finally {
    await mongoose.disconnect();
  }
});

test("a failed multi-slot claim leaves no seats held", { skip }, async () => {
  const { mongoose, SlotCapacity, releaseSeats, reserveSeats } = await load();
  await mongoose.connect(uri);
  await SlotCapacity.deleteMany({});
  try {
    await SlotCapacity.create({ date: "2026-12-02", slot: 1080, seatsBooked: 40 }); // middle slot already full
    assert.equal(await reserveSeats("2026-12-02", [1050, 1080, 1110], 2, 40), false);
    assert.equal((await SlotCapacity.findOne({ date: "2026-12-02", slot: 1050 }))?.seatsBooked ?? 0, 0);
    assert.equal((await SlotCapacity.findOne({ date: "2026-12-02", slot: 1110 }))?.seatsBooked ?? 0, 0);
  } finally {
    await mongoose.disconnect();
  }
});

test("releasing seats makes room again", { skip }, async () => {
  const { mongoose, SlotCapacity, releaseSeats, reserveSeats } = await load();
  await mongoose.connect(uri);
  await SlotCapacity.deleteMany({});
  try {
    assert.equal(await reserveSeats("2026-12-03", [1050], 40, 40), true);
    assert.equal(await reserveSeats("2026-12-03", [1050], 1, 40), false);
    await releaseSeats("2026-12-03", [1050], 40);
    assert.equal(await reserveSeats("2026-12-03", [1050], 1, 40), true);
  } finally {
    await mongoose.disconnect();
  }
});
