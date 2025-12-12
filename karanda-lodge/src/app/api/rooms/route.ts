import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// Disable caching for this API route
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const db = await connectToDatabase();
    const allowedRoomIds = ["family-room", "double-room", "villa"];
    const rooms = await db
      .collection("rooms")
      .find({ id: { $in: allowedRoomIds } })
      .sort({ id: 1 })
      .toArray();

    const response = NextResponse.json({ rooms });
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
  try {
    const db = await connectToDatabase();
    const body = await request.json();
    const roomsArray = body.rooms || [];

    console.log("POST /api/rooms - Received rooms:", roomsArray.length);

    if (roomsArray.length > 0) {
      for (const room of roomsArray) {
        console.log(
          "Updating room:",
          room.id,
          "Availability:",
          JSON.stringify(room.availability)
        );

        // Build update object only with fields that exist
        const updateFields: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        // Always update availability if present
        if (room.availability !== undefined) {
          updateFields.availability = room.availability || {};
        }

        // Only update other fields if they are provided
        if (room.name !== undefined) updateFields.name = room.name;
        if (room.price !== undefined) updateFields.price = room.price;
        if (room.capacity !== undefined) updateFields.capacity = room.capacity;
        if (room.guests !== undefined) updateFields.guests = room.guests;
        if (room.beds !== undefined) updateFields.beds = room.beds;
        if (room.description !== undefined)
          updateFields.description = room.description;
        if (room.images !== undefined) updateFields.images = room.images;
        if (room.cardImage !== undefined)
          updateFields.cardImage = room.cardImage;

        const result = await db.collection("rooms").updateOne(
          { id: room.id },
          {
            $set: updateFields,
          },
          { upsert: true }
        );
        console.log(
          "Update result:",
          result.modifiedCount,
          result.upsertedCount
        );
      }
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
