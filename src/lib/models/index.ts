import { ObjectId } from "mongodb";
import type { Binary } from "mongodb";

export interface Picture {
  _id?: ObjectId;
  filename: string;
  path: string;
  url: string;
  category?: string;
  uploadedAt?: Date;
  description?: string;
}

export interface CalendarEvent {
  _id?: ObjectId;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  bookingId?: string;
  eventType?: "booking" | "maintenance" | "event" | "other";
  status?: "available" | "booked" | "blocked";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Room {
  _id?: ObjectId;
  name: string;
  price: number;
  capacity: number;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
}

/** A guest ID photo after server-side compression (sharp -> WebP). */
export interface GuestIdImage {
  data: Binary; // raw WebP bytes (BSON Binary is ~33% smaller than Base64)
  contentType: "image/webp";
  width: number;
  height: number;
  size: number; // bytes after compression
  originalSize: number; // bytes as received by the server
  uploadedAt: Date;
  uploadedBy: "manager";
}

/**
 * Reservations are entered by the admin as booked dates on each room
 * (rooms.availability). A run of consecutive booked nights is one "stay".
 * A Booking document is created for a stay when the manager uploads the
 * guest's ID images, keyed by `stayId` = `<roomId>_<checkInDate>`.
 */
export interface Booking {
  _id?: ObjectId;
  stayId?: string; // e.g. "villa_2026-11-05" (unique)
  roomId: ObjectId | string; // string room ids: "villa" | "double-room" | "family-room"
  roomName?: string;
  guestName?: string;
  email?: string;
  phone?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests?: number;
  totalPrice?: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  specialRequests?: string;
  idImages?: {
    front?: GuestIdImage;
    back?: GuestIdImage;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
