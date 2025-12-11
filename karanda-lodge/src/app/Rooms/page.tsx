"use client";
import {
  Users,
  Wifi,
  Car,
  Droplet,
  Wind,
  Coffee,
  Tv,
  ArrowRight,
  Bed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./rooms.css";

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

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const loadRooms = () => {
      fetch("/api/rooms?t=" + Date.now())
        .then((res) => res.json())
        .then((data) => {
          if (data.rooms && data.rooms.length > 0) {
            setRooms(data.rooms);
          }
        })
        .catch((err) => console.error("Error loading rooms:", err));
    };
    loadRooms();
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="rooms-page">
        {rooms.map((room) => (
          <div key={room.id} className="room-detail">
            <div className="room-image-container">
              <RoomSlideshow images={room.images} alt={room.name} />
              <span className="price-tag">Rs.{room.price}/night</span>
            </div>
            <div className="room-info">
              <h1 className="room-title">{room.name}</h1>
              <p className="room-desc">{room.description}</p>
              <div className="room-stats">
                <div className="stat">
                  <Users size={20} />
                  <span>{room.guests}</span>
                </div>
                <div className="stat">
                  <Bed size={20} />
                  <span>{room.beds}</span>
                </div>
              </div>
              <div className="room-features">
                <h3>Room Features</h3>
                <div className="features-grid">
                  <div className="feature">
                    <Wind size={18} /> Air Conditioning
                  </div>
                  <div className="feature">
                    <Wifi size={18} /> Free WiFi
                  </div>
                  <div className="feature">
                    <Car size={18} /> Free Parking
                  </div>
                  <div className="feature">
                    <Droplet size={18} /> Hot Water
                  </div>
                  <div className="feature">
                    <Coffee size={18} /> Coffee Maker
                  </div>
                  <div className="feature">
                    <Tv size={18} /> Smart TV
                  </div>
                </div>
              </div>
              <button className="calendar-btn">
                View Calendar <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}
