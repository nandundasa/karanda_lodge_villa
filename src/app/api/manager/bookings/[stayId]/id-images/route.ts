import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { getActiveStays } from "@/lib/stays";
import { compressIdImage, MAX_UPLOAD_BYTES } from "@/lib/idImages";
import type { Booking, GuestIdImage } from "@/lib/models";

export const runtime = "nodejs"; // sharp needs the Node runtime
export const dynamic = "force-dynamic";

let indexReady: Promise<string> | null = null;

/**
 * Upload exactly two ID images (form fields `front` and `back`) for a stay.
 * Replaces any previously uploaded pair.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ stayId: string }> }
) {
  const denied = await requireRole("manager");
  if (denied) return denied;

  const { stayId } = await params;

  try {
    const db = await connectToDatabase();

    // Only allow uploads for a stay that actually exists right now
    const stay = (await getActiveStays(db)).find((s) => s.stayId === stayId);
    if (!stay) {
      return NextResponse.json(
        { error: "Booking not found or already finished" },
        { status: 404 }
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const front = form.get("front");
    const back = form.get("back");
    if (!(front instanceof File) || !(back instanceof File)) {
      return NextResponse.json(
        { error: "Both ID front and ID back images are required" },
        { status: 400 }
      );
    }
    for (const file of [front, back]) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        );
      }
      if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: "Each image must be smaller than 8 MB" },
          { status: 413 }
        );
      }
    }

    let frontImg: GuestIdImage;
    let backImg: GuestIdImage;
    try {
      [frontImg, backImg] = await Promise.all([
        compressIdImage(front),
        compressIdImage(back),
      ]);
    } catch (err) {
      console.error("ID image compression failed:", err);
      return NextResponse.json(
        { error: "Could not read one of the images. Please use JPG, PNG or WebP." },
        { status: 400 }
      );
    }

    const bookings = db.collection<Booking>("bookings");
    indexReady ??= bookings
      .createIndex(
        { stayId: 1 },
        { unique: true, partialFilterExpression: { stayId: { $type: "string" } } }
      )
      .catch((e) => {
        indexReady = null;
        throw e;
      });
    await indexReady;

    const now = new Date();
    await bookings.updateOne(
      { stayId },
      {
        $set: {
          roomId: stay.roomId,
          roomName: stay.roomName,
          checkInDate: new Date(`${stay.checkIn}T00:00:00Z`),
          checkOutDate: new Date(`${stay.checkOut}T00:00:00Z`),
          "idImages.front": frontImg,
          "idImages.back": backImg,
          updatedAt: now,
        },
        $setOnInsert: { stayId, status: "confirmed", createdAt: now },
      },
      { upsert: true }
    );

    const summary = (img: GuestIdImage) => ({
      size: img.size,
      originalSize: img.originalSize,
      width: img.width,
      height: img.height,
      uploadedAt: img.uploadedAt,
    });
    return NextResponse.json({
      success: true,
      idImages: { front: summary(frontImg), back: summary(backImg) },
    });
  } catch (error) {
    console.error("Error uploading ID images:", error);
    return NextResponse.json(
      { error: "Failed to upload ID images" },
      { status: 500 }
    );
  }
}
