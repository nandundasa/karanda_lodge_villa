"use client";
import "./home.css";
import { Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
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

      // Update active section based on scroll position
      const sections = ["home", "rooms", "booking", "gallery", "about"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
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
              <a
                href="#home"
                className={activeSection === "home" ? "active" : ""}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#rooms"
                className={activeSection === "rooms" ? "active" : ""}
              >
                Rooms
              </a>
            </li>
            <li>
              <a
                href="#booking"
                className={activeSection === "booking" ? "active" : ""}
              >
                Booking
              </a>
            </li>
            <li>
              <a
                href="#gallery"
                className={activeSection === "gallery" ? "active" : ""}
              >
                Gallery
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={activeSection === "about" ? "active" : ""}
              >
                About
              </a>
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
    </>
  );
}
