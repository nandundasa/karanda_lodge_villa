"use client";
import "./home.css";
import {
  Star,
  ExternalLink,
  Users,
  Wifi,
  Car,
  Droplet,
  Wind,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
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
              <a href="#home" className="active">
                Home
              </a>
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
              <Star fill="#ffd700" color="#ffd700" />
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
                <Image
                  src="/cover.jpeg"
                  alt="Family Room"
                  width={500}
                  height={300}
                />
                <span className="price-badge">Rs.7500/night</span>
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
                    <Wind size={14} /> AC
                  </span>
                  <span className="amenity">
                    <Wifi size={14} /> WiFi
                  </span>
                  <span className="amenity">
                    <Car size={14} /> Parking
                  </span>
                  <span className="amenity">
                    <Droplet size={14} /> Hot Water
                  </span>
                </div>
                <button className="view-details-btn">View Details →</button>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image">
                <Image
                  src="/IMG_8574.jpeg"
                  alt="Double Room"
                  width={500}
                  height={300}
                />
                <span className="price-badge">Rs.5500/night</span>
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
                    <Wind size={14} /> AC
                  </span>
                  <span className="amenity">
                    <Wifi size={14} /> WiFi
                  </span>
                  <span className="amenity">
                    <Car size={14} /> Parking
                  </span>
                  <span className="amenity">
                    <Droplet size={14} /> Hot Water
                  </span>
                </div>
                <button className="view-details-btn">View Details →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-container">
          <div className="rating-badge-large">
            <Star size={20} fill="#ffd700" color="#ffd700" />
            <span>4.9/5</span>
          </div>
          <h2 className="testimonial-title">Trusted by Our Guests</h2>
          <p className="testimonial-description">
            Join hundreds of satisfied guests who have experienced the magic of
            Karanda
            <br />
            Lodge. Rated excellent on Google with over 250+ reviews.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <Image
                src="/logo.png"
                alt="Karanda Lodge"
                width={40}
                height={40}
              />
              <span>Karanda Lodge</span>
            </div>
            <p className="footer-description">
              Experience nature&apos;s tranquility at Karanda Lodge. Your
              perfect escape surrounded by lush greenery.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="contact-item">
              <Mail size={16} />
              <span>madresort03@gmail.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+94 77 036 7058</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>No.581, Rathanasara Mawatha, Anuradhapura</span>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms & Conditions
            </a>
            <a href="#" className="footer-link">
              Cancellation Policy
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Karanda Lodge. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
