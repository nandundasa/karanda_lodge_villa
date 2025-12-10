import "./home.css";
import { Star } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <nav className="navbar">
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
              <a href="#home">Home</a>
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

      <main className="hero">
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
            <span className="arrow">→</span>
          </button>
        </div>
      </main>
    </>
  );
}
