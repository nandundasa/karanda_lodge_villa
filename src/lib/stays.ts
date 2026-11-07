import type { Db } from "mongodb";
import { ROOM_IDS, addDays, groupConsecutive, resolveBlocks, type RoomDoc } from "./blocks";

/**
 * Stays come from booking blocks (see blocks.ts): one block = one stay with
 * its own unique stayId, so back-to-back guests in the same room are separate
 * stays. Rooms saved before blocks existed are converted on the fly.
 * A villa stay is stored on the villa only (it isn't duplicated into the rooms).
 */

export interface Stay {
  stayId: string; // the block's unique id (legacy blocks: `${roomId}_${checkIn}`)
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD (first night)
  checkOut: string; // YYYY-MM-DD (morning after last night)
  nights: number;
}

/** Today's date at the lodge, independent of the server's timezone. */
export function todayAtLodge(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(
    new Date()
  );
}

export type RoomAvailability = RoomDoc;

/** Pure (browser-safe): every stay in the rooms' booking blocks, unsorted. */
function allStays(rooms: RoomAvailability[]): Stay[] {
  const known = rooms.filter((r) => (ROOM_IDS as readonly string[]).includes(r.id));
  const byRoom = resolveBlocks(known);
  const stays: Stay[] = [];

  for (const room of known) {
    for (const block of byRoom[room.id] ?? []) {
      // Blocks are contiguous by construction; split defensively if not.
      groupConsecutive(block.dates).forEach((nights, i) => {
        stays.push({
          stayId: i === 0 ? block.stayId : `${block.stayId}~${i}`,
          roomId: room.id,
          roomName: room.name || room.id,
          checkIn: nights[0],
          checkOut: addDays(nights[nights.length - 1], 1),
          nights: nights.length,
        });
      });
    }
  }
  return stays;
}

/**
 * Pure (browser-safe): current and upcoming stays (check-out today or later),
 * soonest first.
 */
export function deriveStays(
  rooms: RoomAvailability[],
  today: string = todayAtLodge()
): Stay[] {
  return allStays(rooms)
    .filter((s) => s.checkOut >= today)
    .sort(bySoonestCheckIn);
}

/**
 * Pure (browser-safe): finished stays (check-out before today), most recent
 * check-out first.
 */
export function derivePastStays(
  rooms: RoomAvailability[],
  today: string = todayAtLodge()
): Stay[] {
  return allStays(rooms)
    .filter((s) => s.checkOut < today)
    .sort(byRecentCheckOut);
}

/** Sort order for history lists: latest check-out first. */
export function byRecentCheckOut(a: Stay, b: Stay): number {
  return (
    b.checkOut.localeCompare(a.checkOut) ||
    b.checkIn.localeCompare(a.checkIn) ||
    a.roomId.localeCompare(b.roomId)
  );
}

async function loadRooms(db: Db): Promise<RoomAvailability[]> {
  const rooms = await db
    .collection("rooms")
    .find(
      { id: { $in: [...ROOM_IDS] } },
      { projection: { id: 1, name: 1, availability: 1, blocks: 1 } }
    )
    .toArray();
  return rooms as unknown as RoomAvailability[];
}

/** Current and upcoming stays from the database, soonest first. */
export async function getActiveStays(db: Db): Promise<Stay[]> {
  return deriveStays(await loadRooms(db));
}

/** Finished stays from the database, most recent check-out first. */
export async function getPastStays(db: Db): Promise<Stay[]> {
  return derivePastStays(await loadRooms(db));
}

/** Both lists from a single read of the rooms. */
export async function getAllStays(
  db: Db,
  today: string = todayAtLodge()
): Promise<{ active: Stay[]; past: Stay[] }> {
  const rooms = await loadRooms(db);
  return { active: deriveStays(rooms, today), past: derivePastStays(rooms, today) };
}

/** Sort order for current/upcoming lists: soonest check-in first. */
export function bySoonestCheckIn(a: Stay, b: Stay): number {
  return a.checkIn.localeCompare(b.checkIn) || a.roomId.localeCompare(b.roomId);
}

export type StayPhase = "in-house" | "arriving" | "departing" | "upcoming";

/** Where a stay is relative to today (lodge time). */
export function stayPhase(
  stay: Pick<Stay, "checkIn" | "checkOut">,
  today: string = todayAtLodge()
): StayPhase {
  if (stay.checkOut === today) return "departing";
  if (stay.checkIn === today) return "arriving";
  if (stay.checkIn < today) return "in-house";
  return "upcoming";
}

/** Whole days from today until `date` (negative if in the past). */
export function daysFrom(date: string, today: string = todayAtLodge()): number {
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000
  );
}
