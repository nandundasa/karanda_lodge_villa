import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();

    // Delete existing rooms and seed fresh data
    await db.collection("rooms").deleteMany({});

    // Seed sample rooms
    const sampleRooms = [
      {
        id: "double-room",
        name: "Double Room",
        price: 5500,
        capacity: 2,
        guests: "2 guests",
        beds: "1 Queen",
        description:
          "Intimate and luxurious room designed for couples. Enjoy a romantic ambiance with modern amenities and a private garden view.",
        images: ["/IMG_8581.jpeg", "/IMG_8574.jpeg", "/IMG_9537.jpeg"],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "family-room",
        name: "Family Room",
        price: 7500,
        capacity: 5,
        guests: "4-5 guests",
        beds: "1 King + 1 Queen",
        description:
          "Spacious and comfortable accommodation perfect for families. Features multiple beds, a private balcony, and stunning garden views.",
        images: ["/IMG_8574.jpeg", "/IMG_8581.jpeg", "/IMG_9537.jpeg"],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "villa",
        name: "Villa",
        price: 17000,
        capacity: 9,
        guests: "7-9 guests",
        beds: "1 King + 2 Queen + Double mattress",
        description:
          "Exclusive luxury villa offering complete privacy and comfort. Perfect for groups or families seeking a premium experience with spacious living areas, multiple bedrooms, and stunning panoramic views.",
        images: ["/IMG_9537.jpeg", "/IMG_8574.jpeg", "/IMG_8581.jpeg"],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection("rooms").insertMany(sampleRooms);

    return NextResponse.json({
      message: "Sample rooms seeded successfully",
      insertedCount: result.insertedCount,
      ids: result.insertedIds,
    });
  } catch (error) {
    console.error("Error seeding rooms:", error);
    return NextResponse.json(
      { error: "Failed to seed rooms" },
      { status: 500 }
    );
  }
}
