import sharp from "sharp";
import { Binary } from "mongodb";
import type { GuestIdImage } from "@/lib/models";

export const ID_IMAGE_SIDES = ["front", "back"] as const;
export type IdImageSide = (typeof ID_IMAGE_SIDES)[number];

/** Reject anything larger than this before decoding (client sends ~0.3–0.6 MB). */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const MAX_DIMENSION = 1400; // plenty to read the text on an ID card
const WEBP_QUALITY = 72;

/**
 * Authoritative server-side compression. Whatever the client sent, the
 * stored image is a downscaled WebP with all metadata (EXIF/GPS) stripped.
 * Throws if the file is not a decodable image.
 */
export async function compressIdImage(file: File): Promise<GuestIdImage> {
  const input = Buffer.from(await file.arrayBuffer());

  const { data, info } = await sharp(input, {
    failOn: "error",
    limitInputPixels: 50_000_000, // guard against decompression bombs
  })
    .rotate() // apply EXIF orientation, then metadata is dropped on output
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    data: new Binary(data),
    contentType: "image/webp",
    width: info.width,
    height: info.height,
    size: data.length,
    originalSize: input.length,
    uploadedAt: new Date(),
    uploadedBy: "manager",
  };
}
