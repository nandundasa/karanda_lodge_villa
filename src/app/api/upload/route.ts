import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const denied = await requireRole("admin");
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Keep only a safe base name so the upload can't escape /public
    const fileName = path
      .basename(file.name)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!fileName || fileName.startsWith(".")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(process.cwd(), "public", fileName);

    // Save file to public folder
    fs.writeFileSync(filePath, buffer);

    // Save picture metadata to MongoDB
    const db = await connectToDatabase();
    const result = await db.collection("pictures").insertOne({
      filename: fileName,
      path: filePath,
      url: `/${fileName}`,
      category: category || "general",
      uploadedAt: new Date(),
      description: "",
    });

    return NextResponse.json({
      path: `/${fileName}`,
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
