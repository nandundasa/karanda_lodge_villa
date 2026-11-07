import { NextResponse } from "next/server";
import type { Collection } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAnyRole } from "@/lib/auth";
import { byRecentCheckOut, bySoonestCheckIn, getAllStays, todayAtLodge, type Stay } from "@/lib/stays";
import type { Booking, GuestIdImage } from "@/lib/models";

export const dynamic = "force-dynamic";

const DEFAULT_PAST_LIMIT = 100;
const MAX_PAST_LIMIT = 500;

/**
 * `removedFromCalendar`: the stay's nights were removed from the calendar after
 * ID photos were uploaded. It's listed from its ID record so the photos stay reachable.
 */
type ListedStay = Stay & { removedFromCalendar?: true };

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/**
 * ID records with at least one photo whose stay no longer exists on the
 * calendar, as stays built from the record's stored dates.
 */
async function removedStaysWithIds(
  bookings: Collection<Booking>,
  calendarIds: string[],
  when: "active" | "past",
  today: string
): Promise<ListedStay[]> {
  const todayDate = new Date(`${today}T00:00:00Z`);
  const docs = await bookings
    .find(
      {
        stayId: { $type: "string", $nin: calendarIds },
        // Same rule as calendar stays: checking out today still counts as current
        checkOutDate: when === "active" ? { $gte: todayDate } : { $lt: todayDate },
        $or: [{ "idImages.front": { $exists: true } }, { "idImages.back": { $exists: true } }],
      },
      { projection: { stayId: 1, roomId: 1, roomName: 1, checkInDate: 1, checkOutDate: 1 } }
    )
    .toArray();

  return docs
    .filter((d) => d.checkInDate instanceof Date && !isNaN(+d.checkInDate))
    .map((d) => {
      const checkIn = ymd(d.checkInDate);
      const checkOut = ymd(d.checkOutDate);
      return {
        stayId: d.stayId!,
        roomId: String(d.roomId),
        roomName: d.roomName || String(d.roomId),
        checkIn,
        checkOut,
        nights: Math.max(1, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000)),
        removedFromCalendar: true as const,
      };
    });
}

/**
 * Read-only list of stays with ID-upload status (metadata only, no image bytes).
 * Available to managers and admins; uploading stays manager-only.
 *
 *   GET /api/manager/bookings               current + upcoming stays, soonest check-in first
 *   GET /api/manager/bookings?filter=past   finished stays (check-out before today),
 *                                           most recent check-out first; `limit` (default 100, max 500)
 *
 * Both lists also include stays that were removed from the calendar after
 * their guest ID photos were uploaded (flagged `removedFromCalendar`).
 */
export async function GET(request: Request) {
  const denied = await requireAnyRole(["manager", "admin"]);
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const filter = params.get("filter") ?? "active";
  if (filter !== "active" && filter !== "past") {
    return NextResponse.json(
      { error: 'Invalid filter. Use "past", or leave it out for current and upcoming stays.' },
      { status: 400 }
    );
  }
  const rawLimit = params.get("limit");
  const limit = rawLimit === null ? DEFAULT_PAST_LIMIT : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1) {
    return NextResponse.json({ error: "limit must be a positive whole number" }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const bookingsCol = db.collection<Booking>("bookings");
    const today = todayAtLodge();

    const calendar = await getAllStays(db, today);
    const calendarIds = [...calendar.active, ...calendar.past].map((s) => s.stayId);
    const removed = await removedStaysWithIds(bookingsCol, calendarIds, filter, today);

    let stays: ListedStay[];
    let hasMore = false;
    if (filter === "active") {
      stays = [...calendar.active, ...removed].sort(bySoonestCheckIn);
    } else {
      const all = [...calendar.past, ...removed].sort(byRecentCheckOut);
      const cap = Math.min(limit, MAX_PAST_LIMIT);
      hasMore = all.length > cap;
      stays = all.slice(0, cap);
    }

    const docs = await bookingsCol
      .find(
        { stayId: { $in: stays.map((s) => s.stayId) } },
        {
          projection: {
            stayId: 1,
            "idImages.front.size": 1,
            "idImages.front.uploadedAt": 1,
            "idImages.back.size": 1,
            "idImages.back.uploadedAt": 1,
          },
        }
      )
      .toArray();
    const byStay = new Map(docs.map((d) => [d.stayId, d]));

    const meta = (img?: Partial<GuestIdImage>) =>
      img?.uploadedAt ? { size: img.size, uploadedAt: img.uploadedAt } : null;

    const bookings = stays.map((stay) => {
      const doc = byStay.get(stay.stayId);
      return {
        ...stay,
        idImages: {
          front: meta(doc?.idImages?.front),
          back: meta(doc?.idImages?.back),
        },
      };
    });

    return NextResponse.json(
      filter === "past" ? { bookings, filter, hasMore } : { bookings },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Error fetching manager bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
