import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Picture } from "@/lib/models";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const pictures = await db
      .collection("pictures")
      .find({ category: "gallery" })
      .toArray();

    // Transform to format expected by Gallery page
    const images = pictures.map((pic) => ({
      src: pic.url || pic.path || pic.src,
      alt: pic.description || "Gallery Image",
      span: pic.span || "normal",
      _id: pic._id,
    }));

    const response = NextResponse.json({ images });
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery", images: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const body: Picture = await request.json();

    const result = await db.collection("pictures").insertOne({
      ...body,
      uploadedAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error saving to gallery:", error);
    return NextResponse.json(
      { error: "Failed to save picture" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Picture ID required" },
        { status: 400 }
      );
    }

    await db.collection("pictures").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting picture:", error);
    return NextResponse.json(
      { error: "Failed to delete picture" },
      { status: 500 }
    );
  }
}
