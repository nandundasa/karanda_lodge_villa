import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAnyRole } from "@/lib/auth";
import { ID_IMAGE_SIDES, type IdImageSide } from "@/lib/idImages";
import type { Booking } from "@/lib/models";

export const dynamic = "force-dynamic";

/**
 * Serve one stored guest ID image (WebP bytes from MongoDB) to an
 * authenticated manager OR admin. Read-only; never cached by browsers or proxies.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stayId: string; side: string }> }
) {
  const denied = await requireAnyRole(["manager", "admin"]);
  if (denied) return denied;

  const { stayId, side } = await params;
  if (!ID_IMAGE_SIDES.includes(side as IdImageSide)) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const doc = await db
      .collection<Booking>("bookings")
      .findOne({ stayId }, { projection: { [`idImages.${side}`]: 1 } });

    const image = doc?.idImages?.[side as IdImageSide];
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(image.data.buffer.slice(), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "private, no-store",
        // Guest ID photos must never be indexed or embedded elsewhere
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Disposition": `inline; filename="id-${side}.webp"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error reading ID image:", error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
}
