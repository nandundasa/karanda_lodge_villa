"use client";
import { Leaf, Heart, Award, Users, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./about.css";

export default function About() {
  const openGoogleMaps = () => {
    window.open("https://maps.app.goo.gl/wrRUYL9KVvVR4fuJ8", "_blank");
  };

  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="story-wrapper">
          <div className="about-content">
            <div className="story-section">
              <h1>Our Story</h1>
              <p>
                Nestled in the heart of lush greenery, Karanda Lodge was born
                from a dream to create a sanctuary where nature and comfort
                exist in perfect harmony. Our journey began with a single
                majestic Karanda tree, which stands as a symbol of growth,
                strength, and natural beauty.
              </p>
              <p>
                For over a decade, we have welcomed guests from around the
                world, offering them a peaceful retreat from the hustle of daily
                life. Each room, each pathway, and each moment at Karanda Lodge
                is designed to reconnect you with the tranquility of nature.
              </p>
              <p>
                Our commitment to sustainable tourism and eco-friendly practices
                ensures that the beauty we enjoy today will be preserved for
                generations to come. We believe in creating memories that last a
                lifetime while respecting and protecting our natural
                environment.
              </p>
            </div>

            <div className="tree-section">
              <div className="tree-icon">
                <Leaf size={64} />
              </div>
              <h2>The Karanda Tree</h2>
              <p>
                The Karanda tree, also known as the &quot;Tree of Life,&quot; is
                renowned for its resilience and ability to provide shelter and
                sustenance. Just like this magnificent tree, Karanda Lodge
                offers a safe haven for travelers seeking rest, rejuvenation,
                and connection with nature.
              </p>
            </div>
          </div>
        </section>

        <section className="why-choose-wrapper">
          <div className="why-choose-section">
            <h2>Why Choose Us</h2>
            <p className="subtitle">What makes Karanda Lodge special</p>
            <div className="features">
              <div className="feature-card">
                <div className="feature-icon">
                  <Leaf size={32} />
                </div>
                <h3>Eco-Friendly</h3>
                <p>Sustainable practices and harmony with nature</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Heart size={32} />
                </div>
                <h3>Personalized Service</h3>
                <p>Tailored experiences for every guest</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Award size={32} />
                </div>
                <h3>Award-Winning</h3>
                <p>Recognized for excellence in hospitality</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Users size={32} />
                </div>
                <h3>Family-Friendly</h3>
                <p>Perfect for guests of all ages</p>
              </div>
            </div>
          </div>
        </section>

        <section className="find-us-wrapper">
          <div className="find-us-section">
            <h2>Find Us</h2>
            <p className="subtitle">Located in the heart of nature</p>
            <div className="location-card">
              <div className="location-icon">
                <MapPin size={48} />
              </div>
              <h3>Karanda Lodge</h3>
              <p>No.581/113A, Rathanasara Mawatha, Anuradhapura</p>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.0!2d80.4!3d8.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMTgnMDAuMCJOIDgwwrAyNCcwMC4wIkU!5e0!3m2!1sen!2slk!4v1234567890"
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <button className="maps-btn" onClick={openGoogleMaps}>
                View on Google Maps
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
