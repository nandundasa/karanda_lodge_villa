import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

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
        console.log("Updating room:", room.id, room.name);
        const result = await db.collection("rooms").updateOne(
          { id: room.id },
          {
            $set: {
              id: room.id,
              name: room.name,
              price: room.price,
              capacity: room.capacity,
              guests: room.guests,
              beds: room.beds,
              description: room.description,
              images: room.images,
              availability: room.availability || {},
              updatedAt: new Date(),
            },
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
