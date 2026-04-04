"use client";
import "./home.css";
import {
  Star,
  ExternalLink,
  Users,
  Car,
  Wind,
  ArrowRight,
  Coffee,
  ArchiveRestore,
  SoapDispenserDroplet,
  Flame,
  Home as HomeIcon,
  Bath,
  Utensils,
  Sofa,
  Tv,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [slidesLoaded, setSlidesLoaded] = useState(false);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch("/api/slides?t=" + Date.now());
        const data = await res.json();
        if (data.slides && data.slides.length > 0) {
          const formattedSlides = data.slides
            .map((slide: any) => {
              let url = slide;
              while (url && typeof url === "object") {
                url = url.url || url.src || url;
                if (typeof url === "object" && url.url === url) break;
              }
              return typeof url === "string" ? url : null;
            })
            .filter((slide: any) => slide && slide.length > 0);
          
          setSlides(formattedSlides);
          
          // Preload first 3 images
          formattedSlides.slice(0, 3).forEach((src: string) => {
            const img = new window.Image();
            img.src = src;
          });
          
          setSlidesLoaded(true);
        }
      } catch (err) {
        console.error("Error loading slides:", err);
        setSlidesLoaded(true);
      }
    };
    loadSlides();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetch("/api/rooms?t=" + Date.now());
        const data = await res.json();
        if (data.rooms && data.rooms.length > 0) {
          setRooms(data.rooms);
        }
      } catch (err) {
        console.error("Error loading rooms:", err);
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  return (
    <>
      <Navbar />

      <main className="hero" id="home">
        <div className="slideshow">
          {!slidesLoaded && (
            <div className="slide active" style={{ background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%)' }} />
          )}
          {slides.length > 0 &&
            slides.map((slide, index) => (
              <div
                key={index}
                className={`slide ${index === currentSlide ? "active" : ""}`}
                style={{ backgroundImage: `url(${slide})` }}
              />
            ))}
        </div>
        <div className="hero-content">
          <div className="rating-badge">
            <span className="star">
              <Star fill="#ffd700" color="#ffd700" />
            </span>
            <span>Rated 5/5 on Google</span>
          </div>
          <h1 className="hero-title">
            Experience Nature at
            <br />
            <span className="highlight">Karanda Lodge</span>
          </h1>
          <p className="hero-description">
            Discover tranquility in the heart of nature. Premium accommodations
            <br />
            surrounded by lush greenery and peaceful ambiance.
          </p>
          <button
            className="cta-button"
            onClick={() => router.push("/Booking")}
          >
            Check Availability
            <span className="arrow">
              <ExternalLink />
            </span>
          </button>
        </div>
      </main>

      <section className="villa-section">
        <div className="villa-container">
          <h2 className="villa-title">Book the Entire Villa</h2>
          <p className="villa-subtitle">Experience complete privacy and luxury</p>
          
          <div className="villa-card">
            <div className="villa-image">
              <Image
                src="/IMG_0922.jpeg"
                alt="Entire Villa"
                width={800}
                height={500}
              />
              <span className="price-badge">
                Starting from Rs.{rooms.find(r => r.id === "villa")?.price || "18,000"}/night
              </span>
            </div>
            <div className="villa-content">
              <h3 className="villa-name">Entire Villa</h3>
              <p className="villa-description">
                Complete privacy with both rooms and all amenities. The entire villa includes 
                the Family Room and Double Room, plus exclusive access to all common areas, 
                kitchen, and outdoor spaces.
              </p>
              <div className="villa-guests">
                <Users size={16} />
                <span>7-9 guests</span>
              </div>
              <div className="villa-amenities">
                <span className="amenity">
                  <HomeIcon size={14} /> 2 Bedrooms
                </span>
                <span className="amenity">
                  <Bath size={14} /> 2 Bathrooms
                </span>
                <span className="amenity">
                  <Utensils size={14} /> Full Kitchen
                </span>
                <span className="amenity">
                  <Sofa size={14} /> Living Area
                </span>
                <span className="amenity">
                  <Tv size={14} /> Smart TV
                </span>
                <span className="amenity">
                  <Wind size={14} /> Air Conditioning
                </span>
                <span className="amenity">
                  <Car size={14} /> Free Parking
                </span>
                <span className="amenity">
                  <Flame size={14} /> Hot Water
                </span>
              </div>
              <button
                className="view-details-btn"
                onClick={() => router.push("/Rooms#villa")}
              >
                View Details <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rooms-section">
        <div className="rooms-container">
          <h2 className="rooms-title">Our Premium Rooms</h2>
          <p className="rooms-subtitle">Choose your perfect sanctuary</p>

          <div className="rooms-grid">
            <div className="room-card">
              <div className="room-image">
                <Image
                  src="/IMG_9527.jpeg"
                  alt="Family Room"
                  width={500}
                  height={300}
                />
                <span className="price-badge">
                  Rs.{rooms.find(r => r.id === "family-room")?.price || "7,000-8,000"}/night
                </span>
              </div>
              <div className="room-content">
                <h3 className="room-name">Family Room</h3>
                <p className="room-description">
                  Perfect for families, spacious and comfortable
                </p>
                <div className="room-guests">
                  <Users size={16} />
                  <span>4-5 guests</span>
                </div>
                <div className="room-amenities">
                  <span className="amenity">
                    <Wind size={14} /> Air Conditioning
                  </span>
                  <span className="amenity">
                    <SoapDispenserDroplet size={14} /> Soap
                  </span>
                  <span className="amenity">
                    <Car size={14} /> Free Parking
                  </span>
                  <span className="amenity">
                    <Coffee size={14} /> Kettle
                  </span>
                  <span className="amenity">
                    <ArchiveRestore size={14} /> Cupboard
                  </span>
                  <span className="amenity">
                    <Flame size={14} /> Hot Water
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => router.push("/Rooms#family-room")}
                >
                  View Details <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image">
                <Image
                  src="/IMG_2255.jpeg"
                  alt="Double Room"
                  width={500}
                  height={300}
                />
                <span className="price-badge">
                  Rs.{rooms.find(r => r.id === "double-room")?.price || "6,000"}/night
                </span>
              </div>
              <div className="room-content">
                <h3 className="room-name">Double Room</h3>
                <p className="room-description">
                  Intimate and luxurious for couples
                </p>
                <div className="room-guests">
                  <Users size={16} />
                  <span>2 guests</span>
                </div>
                <div className="room-amenities">
                  <span className="amenity">
                    <Wind size={14} /> Air Conditioning
                  </span>
                  <span className="amenity">
                    <SoapDispenserDroplet size={14} /> Soap
                  </span>
                  <span className="amenity">
                    <Car size={14} /> Free Parking
                  </span>
                  <span className="amenity">
                    <Coffee size={14} /> Kettle
                  </span>
                  <span className="amenity">
                    <ArchiveRestore size={14} /> Cupboard
                  </span>
                  <span className="amenity">
                    <Flame size={14} /> Hot Water
                  </span>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => router.push("/Rooms#double-room")}
                >
                  View Details <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-container">
          <div className="rating-badge-large">
            <Star size={20} fill="#ffd700" color="#ffd700" />
            <span>5/5</span>
          </div>
          <h2 className="testimonial-title">Trusted by Our Guests</h2>
          <p className="testimonial-description">
            Join hundreds of satisfied guests who have experienced the magic of
            Karanda
            <br />
            Lodge. Rated excellent on Google with over 50+ reviews.
          </p>
        </div>
      </section>

      <section className="tiktok-section">
        <div className="tiktok-container">
          <h2 className="tiktok-title">Follow Our Journey</h2>
          <p className="tiktok-subtitle">Watch our latest videos on TikTok</p>
          <div className="tiktok-embed-wrapper">
            <blockquote 
              className="tiktok-embed" 
              cite="https://www.tiktok.com/@karanda.lodge" 
              data-unique-id="karanda.lodge" 
              data-embed-type="creator" 
              style={{ maxWidth: '780px', minWidth: '288px' }}
            >
              <section>
                <a 
                  target="_blank" 
                  href="https://www.tiktok.com/@karanda.lodge?refer=creator_embed"
                  rel="noopener noreferrer"
                >
                  @karanda.lodge
                </a>
              </section>
            </blockquote>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
