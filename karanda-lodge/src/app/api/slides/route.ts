import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const slides = await db
      .collection("slides")
      .find({})
      .sort({ order: 1 })
      .toArray();
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Error fetching slides:", error);
    return NextResponse.json(
      { error: "Failed to fetch slides", slides: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();

    // Clear existing slides and insert new ones
    await db.collection("slides").deleteMany({});
    const slidesArray = body.slides || [];

    if (slidesArray.length > 0) {
      await db.collection("slides").insertMany(
        slidesArray.map((slide: string, index: number) => ({
          url: slide,
          order: index,
          createdAt: new Date(),
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving slides:", error);
    return NextResponse.json(
      { error: "Failed to save slides" },
      { status: 500 }
    );
  }
}
