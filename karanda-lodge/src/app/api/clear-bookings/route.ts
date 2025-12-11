import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const dates = searchParams.getAll("dates"); // Accept multiple dates as query params

    if (dates && dates.length > 0) {
      // Clear bookings for specific dates
      const dateObjects = dates.map((date) => {
        // Parse date string (YYYY-MM-DD format)
        const [year, month, day] = date.split("-").map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        return {
          date: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        };
      });

      // Clear bookings matching any of the dates
      const result = await db.collection("calendar").deleteMany({
        $or: dateObjects,
      });

      return NextResponse.json({
        success: true,
        message: `Cleared bookings for ${dates.length} date(s): ${dates.join(
          ", "
        )}`,
        deletedCount: result.deletedCount,
      });
    } else {
      // Clear all bookings if no specific dates provided
      const result = await db.collection("calendar").deleteMany({});

      return NextResponse.json({
        success: true,
        message: `Cleared all bookings`,
        deletedCount: result.deletedCount,
      });
    }
  } catch (error) {
    console.error("Error clearing bookings:", error);
    return NextResponse.json(
      { error: "Failed to clear bookings" },
      { status: 500 }
    );
  }
}
