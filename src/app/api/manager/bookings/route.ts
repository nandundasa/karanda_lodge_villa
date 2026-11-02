import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { getActiveStays } from "@/lib/stays";
import type { Booking, GuestIdImage } from "@/lib/models";

export const dynamic = "force-dynamic";

/** Read-only list of current/upcoming stays with ID-upload status (no image bytes). */
export async function GET() {
  const denied = await requireRole("manager");
  if (denied) return denied;

  try {
    const db = await connectToDatabase();
    const stays = await getActiveStays(db);

    const docs = await db
      .collection<Booking>("bookings")
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
      { bookings },
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
