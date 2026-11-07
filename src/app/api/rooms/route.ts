import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { randomUUID } from "crypto";
import {
  DATE_RE,
  ROOM_IDS,
  VILLA_ID,
  VILLA_ROOMS,
  BlockError,
  addDays,
  applyBookedDates,
  availabilityMaps,
  ownDates,
  resolveBlocks,
  type RoomDoc,
  type StayBlock,
} from "@/lib/blocks";

/** Unique, URL-safe id for a new stay block */
const newStayId = () => `stay_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
const MAX_DATES_PER_ROOM = 3000;

// Disable caching for this API route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await connectToDatabase();
    const rooms = await db
      .collection("rooms")
      .find({ id: { $in: [...ROOM_IDS] } })
      .sort({ id: 1 })
      .toArray();

    // Blocks are the source of truth; `availability` is derived from them so
    // the public pages (calendars, booking picker) keep their usual shape.
    const byRoom = resolveBlocks(rooms as unknown as RoomDoc[]);
    const maps = availabilityMaps(byRoom);
    const out = rooms.map((r) => ({
      ...r,
      blocks: byRoom[r.id] ?? [],
      availability: maps[r.id] ?? {},
    }));

    const response = NextResponse.json({ rooms: out });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms", rooms: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireRole("admin");
  if (denied) return denied;

  try {
    const db = await connectToDatabase();
    const body = await request.json();
    const roomsArray: Record<string, unknown>[] = Array.isArray(body.rooms) ? body.rooms : [];

    // ---- Booked nights (stay blocks) ---------------------------------------
    const bookingUpdates = roomsArray.filter(
      (r) => r && (r.bookedDates !== undefined || r.availability !== undefined)
    );
    if (bookingUpdates.length > 0) {
      const result = await saveBookings(db, bookingUpdates);
      if (result) return result; // validation error / conflict
    }

    // ---- Other room fields (prices, text, images) --------------------------
    for (const room of roomsArray) {
      if (!room || typeof room.id !== "string") continue;
      const updateFields: Record<string, unknown> = {};
      for (const key of ["name", "price", "capacity", "guests", "beds", "description", "images", "cardImage"]) {
        if (room[key] !== undefined) updateFields[key] = room[key];
      }
      if (Object.keys(updateFields).length === 0) continue;
      updateFields.updatedAt = new Date();
      await db.collection("rooms").updateOne({ id: room.id }, { $set: updateFields }, { upsert: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving rooms:", error);
    return NextResponse.json(
      { error: "Failed to save rooms" },
      { status: 500 }
    );
  }
}

/**
 * Apply one admin save of booked nights. Each room in `updates` carries its
 * complete set of own booked nights (`bookedDates`, or the legacy
 * `availability` map). Nights new in this save become new stay blocks, even
 * when they touch an existing stay, unless they're listed in `extensions`
 * ([{ stayId, dates }]), which adds them to that existing stay instead.
 * Removed nights shrink or delete blocks.
 * Returns an error response, or null on success.
 */
async function saveBookings(
  db: Awaited<ReturnType<typeof connectToDatabase>>,
  updates: Record<string, unknown>[]
): Promise<NextResponse | null> {
  // Parse + validate the requested sets
  const requested = new Map<string, Set<string>>();
  const extensions = new Map<string, Record<string, string[]>>();
  for (const u of updates) {
    const id = u.id;
    if (typeof id !== "string" || !(ROOM_IDS as readonly string[]).includes(id)) {
      return NextResponse.json({ error: `Unknown room: ${String(id)}` }, { status: 400 });
    }
    const list = Array.isArray(u.bookedDates)
      ? u.bookedDates
      : Object.entries((u.availability as Record<string, unknown>) || {})
          .filter(([, b]) => b === true)
          .map(([d]) => d);
    if (list.length > MAX_DATES_PER_ROOM || !list.every((d) => typeof d === "string" && DATE_RE.test(d))) {
      return NextResponse.json({ error: `Invalid dates for ${id}` }, { status: 400 });
    }
    requested.set(id, new Set(list as string[]));

    if (u.extensions !== undefined) {
      if (!Array.isArray(u.extensions)) {
        return NextResponse.json({ error: `Invalid extensions for ${id}` }, { status: 400 });
      }
      const ext: Record<string, string[]> = {};
      for (const e of u.extensions as { stayId?: unknown; dates?: unknown }[]) {
        if (
          !e ||
          typeof e.stayId !== "string" ||
          !Array.isArray(e.dates) ||
          !e.dates.every((d) => typeof d === "string" && DATE_RE.test(d))
        ) {
          return NextResponse.json({ error: `Invalid extensions for ${id}` }, { status: 400 });
        }
        ext[e.stayId] = [...(ext[e.stayId] ?? []), ...(e.dates as string[])];
      }
      extensions.set(id, ext);
    }
  }

  const docs = (await db
    .collection("rooms")
    .find({ id: { $in: [...ROOM_IDS] } }, { projection: { id: 1, availability: 1, blocks: 1 } })
    .toArray()) as unknown as RoomDoc[];
  const prev = resolveBlocks(docs);
  const prevOwn = (id: string) => ownDates(prev[id] ?? []);

  const prevVilla = prevOwn(VILLA_ID);
  const finalVilla = requested.get(VILLA_ID) ?? prevVilla;

  // The villa can't take a night that a room inside it is separately booked for.
  const conflicts: { room: string; dates: string[] }[] = [];
  const finalOwn = new Map<string, Set<string>>([[VILLA_ID, finalVilla]]);
  for (const roomId of VILLA_ROOMS) {
    const own = prevOwn(roomId);
    const req = requested.get(roomId) ?? own;
    const clash = [...req].filter((d) => finalVilla.has(d) && !prevVilla.has(d) && own.has(d));
    if (clash.length) conflicts.push({ room: roomId, dates: clash.sort() });
    // Villa nights belong to the villa block, never to the rooms (older
    // clients sent them in the room sets too).
    finalOwn.set(roomId, new Set([...req].filter((d) => !finalVilla.has(d))));
  }
  // A room's stay can't be extended onto nights the whole villa is booked
  for (const roomId of VILLA_ROOMS) {
    const clash = Object.values(extensions.get(roomId) ?? {})
      .flat()
      .filter((d) => finalVilla.has(d))
      .sort();
    if (clash.length) {
      return NextResponse.json(
        { error: `Can't extend into nights the whole villa is booked: ${roomId} (${clash.join(", ")})`, conflicts: [{ room: roomId, dates: clash }] },
        { status: 409 }
      );
    }
  }
  if (conflicts.length) {
    const list = conflicts.map((c) => `${c.room} (${c.dates.join(", ")})`).join("; ");
    return NextResponse.json(
      { error: `The villa can't be booked on nights a room is already booked: ${list}`, conflicts },
      { status: 409 }
    );
  }

  const now = new Date();
  const next: Record<string, StayBlock[]> = {};
  try {
    for (const roomId of ROOM_IDS) {
      next[roomId] = applyBookedDates(
        prev[roomId] ?? [],
        finalOwn.get(roomId) ?? prevOwn(roomId),
        newStayId,
        now,
        extensions.get(roomId)
      );
    }
  } catch (e) {
    if (e instanceof BlockError) return NextResponse.json({ error: e.message }, { status: 400 });
    throw e;
  }
  const maps = availabilityMaps(next);

  // Write every room: a villa change alters the rooms' derived maps, and this
  // also persists converted legacy blocks the first time.
  for (const roomId of ROOM_IDS) {
    if (!docs.some((d) => d.id === roomId)) continue; // never create rooms here
    await db.collection("rooms").updateOne(
      { id: roomId },
      { $set: { blocks: next[roomId], availability: maps[roomId], updatedAt: now } }
    );
  }

  // Keep the stored dates on guest-ID records in step with stays whose nights
  // changed (e.g. extended), so they never go stale. Ids are unchanged.
  for (const roomId of ROOM_IDS) {
    for (const block of next[roomId]) {
      const before = (prev[roomId] ?? []).find((b) => b.stayId === block.stayId);
      if (!before || before.dates.join() === block.dates.join()) continue;
      await db.collection("bookings").updateOne(
        { stayId: block.stayId },
        {
          $set: {
            checkInDate: new Date(`${block.dates[0]}T00:00:00Z`),
            checkOutDate: new Date(`${addDays(block.dates[block.dates.length - 1], 1)}T00:00:00Z`),
            updatedAt: now,
          },
        }
      );
    }
  }
  return null;
}
