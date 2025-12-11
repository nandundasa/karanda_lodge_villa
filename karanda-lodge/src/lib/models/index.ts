import { ObjectId } from "mongodb";

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

export interface Booking {
  _id?: ObjectId;
  roomId: ObjectId;
  guestName: string;
  email: string;
  phone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  specialRequests?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
