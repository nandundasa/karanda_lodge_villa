import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { Picture } from "@/lib/models";
import { ObjectId } from "mongodb";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const sizeCache = new Map<string, { width: number; height: number } | null>();

/**
 * Intrinsic size of a local /public image (reads only the header), so the
 * gallery can lay out its masonry grid without layout shift. Cached per URL.
 */
async function localImageSize(url: unknown) {
  if (typeof url !== "string" || !url.startsWith("/")) return null;
  if (sizeCache.has(url)) return sizeCache.get(url)!;
  const file = path.resolve(PUBLIC_DIR, "." + decodeURIComponent(url.split("?")[0]));
  let size: { width: number; height: number } | null = null;
  if (file.startsWith(PUBLIC_DIR + path.sep)) {
    try {
      const meta = await sharp(file).metadata();
      if (meta.width && meta.height) {
        // EXIF orientations 5–8 are rotated 90°
        const rotated = (meta.orientation ?? 1) >= 5;
        size = rotated ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
      }
    } catch {
      size = null; // missing or unreadable file
    }
  }
  sizeCache.set(url, size);
  return size;
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const pictures = await db
      .collection("pictures")
      .find({ category: "gallery" })
      .toArray();

    // Transform to format expected by the Gallery page and admin dashboard
    const images = await Promise.all(
      pictures.map(async (pic) => {
        const src = pic.url || pic.path || pic.src;
        const size = await localImageSize(src);
        return {
          src,
          alt: pic.description || "Gallery Image",
          span: pic.span || "normal",
          _id: pic._id,
          ...(size ?? {}),
        };
      })
    );

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
  const denied = await requireRole("admin");
  if (denied) return denied;

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
  const denied = await requireRole("admin");
  if (denied) return denied;

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
