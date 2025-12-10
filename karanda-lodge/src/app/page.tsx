"use client";
import "./home.css";
import { Star, ExternalLink, Users, Wifi, Car, Droplet, Wind } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const slides = ["/cover.jpeg", "/IMG_8574.jpeg", "/IMG_9537.jpeg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="logo">
            <Image
              src="/logo.png"
              alt="Karanda Lodge"
              className="logo-icon"
              width={40}
              height={40}
            />
            <span>Karanda Lodge</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#home" className="active">Home</a>
            </li>
            <li>
              <a href="#rooms">Rooms</a>
            </li>
            <li>
              <a href="#booking">Booking</a>
            </li>
            <li>
              <a href="#gallery">Gallery</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </div>
      </nav>

      <main className="hero" id="home">
        <div className="slideshow">
          {slides.map((slide, index) => (
            <div
              key={slide}
              className={`slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
        </div>
        <div className="hero-content">
          <div className="rating-badge">
            <span className="star">
              <Star />
            </span>
            <span>Rated 4.9/5 on Google</span>
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
          <button className="cta-button">
            Check Availability
            <span className="arrow">
              <ExternalLink />
            </span>
          </button>
        </div>
      </main>

      <section className="rooms-section" id="rooms">
        <div className="rooms-container">
          <h2 className="rooms-title">Our Premium Rooms</h2>
          <p className="rooms-subtitle">Choose your perfect sanctuary</p>
          
          <div className="rooms-grid">
            <div className="room-card">
              <div className="room-image">
                <Image src="/cover.jpeg" alt="Family Room" width={500} height={300} />
                <span className="price-badge">$150/night</span>
              </div>
              <div className="room-content">
                <h3 className="room-name">Family Room</h3>
                <p className="room-description">Perfect for families, spacious and comfortable</p>
                <div className="room-guests">
                  <Users size={16} />
                  <span>4-6 guests</span>
                </div>
                <div className="room-amenities">
                  <span className="amenity"><Wind size={14} /> AC</span>
                  <span className="amenity"><Wifi size={14} /> WiFi</span>
                  <span className="amenity"><Car size={14} /> Parking</span>
                  <span className="amenity"><Droplet size={14} /> Hot Water</span>
                </div>
                <button className="view-details-btn">View Details →</button>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image">
                <Image src="/IMG_8574.jpeg" alt="Double Room" width={500} height={300} />
                <span className="price-badge">$120/night</span>
              </div>
              <div className="room-content">
                <h3 className="room-name">Double Room</h3>
                <p className="room-description">Intimate and luxurious for couples</p>
                <div className="room-guests">
                  <Users size={16} />
                  <span>2 guests</span>
                </div>
                <div className="room-amenities">
                  <span className="amenity"><Wind size={14} /> AC</span>
                  <span className="amenity"><Wifi size={14} /> WiFi</span>
                  <span className="amenity"><Car size={14} /> Parking</span>
                  <span className="amenity"><Droplet size={14} /> Hot Water</span>
                </div>
                <button className="view-details-btn">View Details →</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
