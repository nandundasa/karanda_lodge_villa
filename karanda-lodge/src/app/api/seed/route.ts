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
        images: [
          "/IMG_2255.jpeg",
          "/IMG_2256.jpeg",
          "/IMG_2254.jpeg",
          "/IMG_2257.jpeg",
          "/IMG_2263.jpeg",
          "/IMG_2262.jpeg",
          "/IMG_2260.jpeg",
          "/IMG_2259.jpeg",
          "/IMG_2258.jpeg",
          "/IMG_2261.jpeg",
          "/IMG_2267.jpeg",
          "/IMG_3650.jpeg",
          "/IMG_3653.jpeg",
          "/IMG_2268.jpeg",
        ],
        availability: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "family-room",
        name: "Family Room",
        price: "6500-7500",
        capacity: 5,
        guests: "4-5 guests",
        beds: "1 King + 1 Queen",
        description:
          "Spacious and comfortable accommodation perfect for families. Features multiple beds, a private balcony, and stunning garden views.",
        images: [
          "/IMG_9527.jpeg",
          "/IMG_9537.jpeg",
          "/IMG_9539.jpeg",
          "/IMG_9541.jpeg",
          "/IMG_9531.jpeg",
          "/IMG_9296.jpeg",
          "/IMG_9297.jpeg",
          "/IMG_9541.jpeg",
          "/IMG_8587.jpeg",
          "/IMG_8588.jpeg",
          "/IMG_9542.jpeg",
          "/IMG_9543.jpeg",
          "/IMG_9544.jpeg",
        ],
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
        images: [
          "/IMG_3663.jpeg",
          "/IMG_0922.jpeg",
          "/IMG_0923.jpeg",
          "/IMG_0933.jpeg",
          "/IMG_0934.jpeg",
          "/IMG_0937.jpeg",
          "/IMG_0939.jpeg",
          "/IMG_0926.jpeg",
          "/IMG_0928.jpeg",
          "/IMG_0929.jpeg",
          "/IMG_0931.jpeg",
          "/IMG_0932.jpeg",
          "/IMG_0924.jpeg",
          "/IMG_0925.jpeg",
          "/IMG_0938.jpeg",
          "/IMG_3660.jpeg",
          "/IMG_0940.jpeg",
          "/IMG_9296.jpeg",
          "/IMG_9297.jpeg",
          "/IMG_2203.jpeg",
          "/IMG_0240.jpeg",
          "/IMG_0241.jpeg",
          "/IMG_0242.jpeg",
          "/IMG_0243.jpeg",
          "/IMG_9527.jpeg",
          "/IMG_9537.jpeg",
          "/IMG_9539.jpeg",
          "/IMG_9541.jpeg",
          "/IMG_9531.jpeg",
          "/IMG_9296.jpeg",
          "/IMG_9297.jpeg",
          "/IMG_9541.jpeg",
          "/IMG_8587.jpeg",
          "/IMG_8588.jpeg",
          "/IMG_9542.jpeg",
          "/IMG_9543.jpeg",
          "/IMG_9544.jpeg",
          "/IMG_2255.jpeg",
          "/IMG_2256.jpeg",
          "/IMG_2254.jpeg",
          "/IMG_2257.jpeg",
          "/IMG_2263.jpeg",
          "/IMG_2262.jpeg",
          "/IMG_2260.jpeg",
          "/IMG_2259.jpeg",
          "/IMG_2258.jpeg",
          "/IMG_2261.jpeg",
          "/IMG_2267.jpeg",
          "/IMG_3650.jpeg",
          "/IMG_3653.jpeg",
          "/IMG_2268.jpeg",
          "/IMG_8589.jpeg",
          "/IMG_0918.jpeg",
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
