import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();

    // Update prices without affecting availability data
    await db.collection("rooms").updateOne(
      { id: "double-room" },
      { $set: { price: 6000, updatedAt: new Date() } }
    );

    await db.collection("rooms").updateOne(
      { id: "family-room" },
      { $set: { price: "7000-8000", updatedAt: new Date() } }
    );

    await db.collection("rooms").updateOne(
      { id: "villa" },
      { $set: { price: 18000, updatedAt: new Date() } }
    );

    return NextResponse.json({
      message: "Room prices updated successfully",
      prices: {
        "double-room": 6000,
        "family-room": "7000-8000",
        "villa": 18000
      }
    });
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json(
      { error: "Failed to update prices" },
      { status: 500 }
    );
  }
}
