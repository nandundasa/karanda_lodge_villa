import type { Db } from "mongodb";

/**
 * The admin records reservations as booked dates per room
 * (rooms.availability = { "YYYY-MM-DD": true }). This turns those dates into
 * stays: each run of consecutive booked nights in a room is one stay.
 *
 * Booking the Villa also marks Double Room + Family Room as booked, so any
 * date booked on the Villa is attributed to the Villa only.
 */

export interface Stay {
  stayId: string; // `${roomId}_${checkIn}`
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD (first night)
  checkOut: string; // YYYY-MM-DD (morning after last night)
  nights: number;
}

const ROOM_IDS = ["villa", "double-room", "family-room"] as const;
const VILLA_ID = "villa";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date at the lodge, independent of the server's timezone. */
export function todayAtLodge(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(
    new Date()
  );
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function groupConsecutive(dates: string[]): string[][] {
  const sorted = [...dates].sort();
  const groups: string[][] = [];
  for (const date of sorted) {
    const last = groups[groups.length - 1];
    if (last && addDays(last[last.length - 1], 1) === date) last.push(date);
    else groups.push([date]);
  }
  return groups;
}

export type RoomAvailability = {
  id: string;
  name?: string;
  availability?: Record<string, boolean> | null;
};

/**
 * Pure (browser-safe) version: turn rooms' booked dates into current and
 * upcoming stays (check-out today or later), soonest first.
 */
export function deriveStays(
  rooms: RoomAvailability[],
  today: string = todayAtLodge()
): Stay[] {
  const bookedDates = (availability: unknown): string[] =>
    Object.entries((availability as Record<string, boolean>) || {})
      .filter(([date, booked]) => booked === true && DATE_RE.test(date))
      .map(([date]) => date);

  const known = rooms.filter((r) =>
    (ROOM_IDS as readonly string[]).includes(r.id)
  );
  const villa = known.find((r) => r.id === VILLA_ID);
  const villaDates = new Set(villa ? bookedDates(villa.availability) : []);
  const stays: Stay[] = [];

  for (const room of known) {
    let dates = bookedDates(room.availability);
    if (room.id !== VILLA_ID) dates = dates.filter((d) => !villaDates.has(d));

    for (const nights of groupConsecutive(dates)) {
      const checkIn = nights[0];
      const checkOut = addDays(nights[nights.length - 1], 1);
      if (checkOut < today) continue; // finished stays are hidden
      stays.push({
        stayId: `${room.id}_${checkIn}`,
        roomId: room.id,
        roomName: room.name || room.id,
        checkIn,
        checkOut,
        nights: nights.length,
      });
    }
  }

  return stays.sort(
    (a, b) =>
      a.checkIn.localeCompare(b.checkIn) || a.roomId.localeCompare(b.roomId)
  );
}

/** Current and upcoming stays from the database, soonest first. */
export async function getActiveStays(db: Db): Promise<Stay[]> {
  const rooms = await db
    .collection("rooms")
    .find(
      { id: { $in: [...ROOM_IDS] } },
      { projection: { id: 1, name: 1, availability: 1 } }
    )
    .toArray();
  return deriveStays(rooms as unknown as RoomAvailability[]);
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
