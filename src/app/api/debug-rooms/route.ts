import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();

    // Get all rooms (no filter)
    const allRooms = await db.collection("rooms").find({}).toArray();

    console.log(`[Debug API] Total rooms in database: ${allRooms.length}`);
    allRooms.forEach((room, index) => {
      console.log(
        `[Debug API] Room ${index}: id=${room.id}, name=${room.name}, _id=${
          room._id
        }, availability count=${Object.keys(room.availability || {}).length}`
      );
    });

    return NextResponse.json({
      totalRooms: allRooms.length,
      rooms: allRooms.map((r) => ({
        _id: r._id,
        id: r.id,
        name: r.name,
        availabilityCount: Object.keys(r.availability || {}).length,
        availability: r.availability,
      })),
    });
  } catch (error) {
    console.error("Error fetching debug info:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug info" },
      { status: 500 }
    );
  }
}
