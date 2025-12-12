import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(process.cwd(), "public", file.name);

    // Save file to public folder
    fs.writeFileSync(filePath, buffer);

    // Save picture metadata to MongoDB
    const db = await connectToDatabase();
    const result = await db.collection("pictures").insertOne({
      filename: file.name,
      path: filePath,
      url: `/${file.name}`,
      category: category || "general",
      uploadedAt: new Date(),
      description: "",
    });

    return NextResponse.json({
      path: `/${file.name}`,
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
