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
        price: 6000,
        capacity: 2,
        guests: "2 guests",
        beds: "1 Queen",
        description:
          "Intimate and luxurious room designed for couples. Enjoy a romantic ambiance with modern amenities and a private garden view.",
        images: [
          "/IMG_2255.webp",
          "/IMG_2256.webp",
          "/IMG_2254.webp",
          "/IMG_2257.webp",
          "/IMG_2263.webp",
          "/IMG_2262.webp",
          "/IMG_2260.webp",
          "/IMG_2259.webp",
          "/IMG_2258.webp",
          "/IMG_2261.webp",
          "/IMG_2267.webp",
          "/IMG_3650.webp",
          "/IMG_3653.webp",
          "/IMG_2268.webp",
        ],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "family-room",
        name: "Family Room",
        price: "7000-8000",
        capacity: 5,
        guests: "4-5 guests",
        beds: "1 King + 1 Queen",
        description:
          "Spacious and comfortable accommodation perfect for families. Features multiple beds, a private balcony, and stunning garden views.",
        images: [
          "/IMG_9527.webp",
          "/IMG_9537.webp",
          "/IMG_9539.webp",
          "/IMG_9541.webp",
          "/IMG_9531.webp",
          "/IMG_9296.webp",
          "/IMG_9297.webp",
          "/IMG_9541.webp",
          "/IMG_8587.webp",
          "/IMG_8588.webp",
          "/IMG_9542.webp",
          "/IMG_9543.webp",
          "/IMG_9544.webp",
        ],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "villa",
        name: "Villa",
        price: 18000,
        capacity: 9,
        guests: "7-9 guests",
        beds: "1 King + 2 Queen + Double mattress",
        description:
          "Exclusive luxury villa offering complete privacy and comfort. Perfect for groups or families seeking a premium experience with spacious living areas, multiple bedrooms, and stunning panoramic views.",
        images: [
          "/IMG_3663.webp",
          "/IMG_0922.webp",
          "/IMG_0923.webp",
          "/IMG_0933.webp",
          "/IMG_0934.webp",
          "/IMG_0937.webp",
          "/IMG_0939.webp",
          "/IMG_0926.webp",
          "/IMG_0928.webp",
          "/IMG_0929.webp",
          "/IMG_0931.webp",
          "/IMG_0932.webp",
          "/IMG_0924.webp",
          "/IMG_0925.webp",
          "/IMG_0938.webp",
          "/IMG_3660.webp",
          "/IMG_0940.webp",
          "/IMG_9296.webp",
          "/IMG_9297.webp",
          "/IMG_2203.webp",
          "/IMG_0240.webp",
          "/IMG_0241.webp",
          "/IMG_0242.webp",
          "/IMG_0243.webp",
          "/IMG_9527.webp",
          "/IMG_9537.webp",
          "/IMG_9539.webp",
          "/IMG_9541.webp",
          "/IMG_9531.webp",
          "/IMG_9296.webp",
          "/IMG_9297.webp",
          "/IMG_9541.webp",
          "/IMG_8587.webp",
          "/IMG_8588.webp",
          "/IMG_9542.webp",
          "/IMG_9543.webp",
          "/IMG_9544.webp",
          "/IMG_2255.webp",
          "/IMG_2256.webp",
          "/IMG_2254.webp",
          "/IMG_2257.webp",
          "/IMG_2263.webp",
          "/IMG_2262.webp",
          "/IMG_2260.webp",
          "/IMG_2259.webp",
          "/IMG_2258.webp",
          "/IMG_2261.webp",
          "/IMG_2267.webp",
          "/IMG_3650.webp",
          "/IMG_3653.webp",
          "/IMG_2268.webp",
          "/IMG_8589.webp",
          "/IMG_0918.webp",
        ],
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
