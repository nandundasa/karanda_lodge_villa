"use client";
import {
  Users,
  SoapDispenserDroplet,
  Car,
  Droplet,
  Wind,
  Coffee,
  ArchiveRestore,
  Bed,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tv,
  Utensils,
  Bath,
  Sofa,
  Wifi,
  Home,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./rooms.css";

interface Room {
  _id?: string;
  id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  guests?: string | number;
  capacity?: number;
  beds?: string | number;
  availability?: Record<string, boolean>;
}

// Room slideshow component
function RoomSlideshow({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="slideshow-container">
      <Image
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        width={700}
        height={500}
        className="room-main-image"
      />
      {images.length > 1 && (
        <>
          <button className="slide-btn prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="slide-btn next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
          <div className="slide-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Mini calendar component for each room
function RoomCalendar({
  availability,
}: {
  availability: Record<string, boolean>;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getDatesForMonth = () => {
    const dates = [];
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const year = currentYear;
      const month = String(currentMonth + 1).padStart(2, "0");
      const day = String(d).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const getMonthName = () => {
    return new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="room-calendar">
      <div className="calendar-nav">
        <button onClick={goToPreviousMonth}>
          <ChevronLeft size={18} />
        </button>
        <span>{getMonthName()}</span>
        <button onClick={goToNextMonth}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar-weekdays">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>
      <div className="calendar-days">
        {Array.from({
          length: new Date(currentYear, currentMonth, 1).getDay(),
        }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}
        {getDatesForMonth().map((date) => {
          const isBooked = availability && availability[date] === true;
          const [year, month, day] = date.split("-").map(Number);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dateObj = new Date(year, month - 1, day);
          const isPast = dateObj < today;

          return (
            <div
              key={date}
              className={`calendar-day ${isBooked ? "booked" : "available"} ${
                isPast ? "past" : ""
              }`}
              title={isBooked ? "Booked" : "Available"}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="dot available"></span> Available
        </span>
        <span className="legend-item">
          <span className="dot booked"></span> Booked
        </span>
      </div>
    </div>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCalendar, setShowCalendar] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = () => {
      fetch("/api/rooms?t=" + Date.now())
        .then((res) => res.json())
        .then((data) => {
          if (data.rooms && data.rooms.length > 0) {
            setRooms(data.rooms);
          } else {
            setRooms([]);
          }
        })
        .catch((err) => console.error("Error loading rooms:", err));
    };
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get combined availability for Villa (includes Family Room + Double Room bookings)
  const getVillaAvailability = (): Record<string, boolean> => {
    const familyRoom = rooms.find((r) => r.id === "family-room");
    const doubleRoom = rooms.find((r) => r.id === "double-room");
    const villa = rooms.find((r) => r.id === "villa");

    const combined: Record<string, boolean> = {};

    // Add Villa's own bookings
    if (villa?.availability) {
      Object.entries(villa.availability).forEach(([date, isBooked]) => {
        if (isBooked) combined[date] = true;
      });
    }

    // Add Family Room bookings (Villa is unavailable when Family Room is booked)
    if (familyRoom?.availability) {
      Object.entries(familyRoom.availability).forEach(([date, isBooked]) => {
        if (isBooked) combined[date] = true;
      });
    }

    // Add Double Room bookings (Villa is unavailable when Double Room is booked)
    if (doubleRoom?.availability) {
      Object.entries(doubleRoom.availability).forEach(([date, isBooked]) => {
        if (isBooked) combined[date] = true;
      });
    }

    return combined;
  };

  // Get availability for a room (with special handling for Villa)
  const getRoomAvailability = (room: Room): Record<string, boolean> => {
    if (room.id === "villa") {
      return getVillaAvailability();
    }
    return room.availability || {};
  };

  return (
    <>
      <Navbar />
      <main className="rooms-page">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div key={room._id || room.id} className="room-detail">
              <div className="room-image-container">
                <RoomSlideshow
                  images={
                    room.images && room.images.length > 0
                      ? room.images
                      : ["/placeholder-room.png"]
                  }
                  alt={room.name}
                />
                <span className="price-tag">
                  {room.name === "Villa"
                    ? `Starting from Rs.${room.price}/night`
                    : `Rs.${room.price}/night`}
                </span>
              </div>
              <div className="room-info">
                <h1 className="room-title">{room.name}</h1>
                <p className="room-desc">{room.description}</p>
                <div className="room-stats">
                  <div className="stat">
                    <Users size={20} />
                    <span>{room.guests || room.capacity || 2}</span>
                  </div>
                  <div className="stat">
                    <Bed size={20} />
                    <span>{room.beds || 1}</span>
                  </div>
                </div>
                <div className="room-features">
                  <h3>
                    {room.id === "villa" ? "Villa Features" : "Room Features"}
                  </h3>
                  <div className="features-grid">
                    {room.id === "villa" ? (
                      <>
                        <div className="feature">
                          <Home size={18} /> 2 Bedrooms
                        </div>
                        <div className="feature">
                          <Bath size={18} /> 2 Bathrooms
                        </div>
                        <div className="feature">
                          <Utensils size={18} /> Full Kitchen
                        </div>
                        <div className="feature">
                          <Sofa size={18} /> Living Area
                        </div>
                        <div className="feature">
                          <Tv size={18} /> Smart TV
                        </div>
                        <div className="feature">
                          <Wind size={18} /> Air Conditioning
                        </div>
                        <div className="feature">
                          <Car size={18} /> Free Parking
                        </div>
                        <div className="feature">
                          <Coffee size={18} /> Kettle
                        </div>
                        <div className="feature">
                          <ArchiveRestore size={18} /> Cupboards
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="feature">
                          <Wind size={18} /> Air Conditioning
                        </div>
                        <div className="feature">
                          <SoapDispenserDroplet size={18} /> Soap
                        </div>
                        <div className="feature">
                          <Car size={18} /> Free Parking
                        </div>
                        <div className="feature">
                          <Coffee size={18} /> Kettle
                        </div>
                        <div className="feature">
                          <ArchiveRestore size={18} /> Cupboard
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="calendar-btn"
                  onClick={() =>
                    setShowCalendar(showCalendar === room.id ? null : room.id)
                  }
                >
                  <Calendar size={20} />{" "}
                  {showCalendar === room.id ? "Hide" : "View"} Calendar
                </button>
                {showCalendar === room.id && (
                  <RoomCalendar availability={getRoomAvailability(room)} />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-rooms">
            <p>No rooms available at the moment.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
