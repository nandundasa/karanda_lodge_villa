"use client";
import {
  Leaf,
  Heart,
  Award,
  Users,
  MapPin,
  Star,
  Siren,
  Building,
  PhoneOutgoing,
} from "lucide-react";
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
                  <Siren size={32} />
                </div>
                <h3>24 hours Customer Service</h3>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Leaf size={32} />
                </div>
                <h3>Cleanliness</h3>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Building size={32} />
                </div>
                <h3>Spacious</h3>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <PhoneOutgoing size={32} />
                </div>
                <h3>Happy Customer Service</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="feedback-wrapper">
          <div className="feedback-section">
            <h2>Guest Feedback</h2>
            <p className="subtitle">
              What our guests say about their experience
            </p>
            <div className="testimonials">
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p className="testimonial-text">
                  The place was clean and modern, equipped with all necessary
                  amenities. The room was spacious, and the bed was extremely
                  comfortable. Secure parking was available within the premises.
                  Its close proximity to major attractions like stupas and
                  temples in the sacred city was very convenient. Supermarkets
                  and restaurants were also nearby. The host was very friendly
                  and went above and beyond to accommodate us, providing
                  detailed information about local attractions, dining, and
                  transportation. Highly recommended!
                </p>
                <div className="testimonial-author">
                  <h4>Prageeth Nuwan</h4>
                  <p>Australia</p>
                </div>
                <p className="testimonial-date">July 2024</p>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p className="testimonial-text">
                  We had a lovely stay at Karanda Lodge for two nights. The room
                  is upstairs in a super nice villa which also has private
                  parking. The room and the house was very clean, comfortable
                  and spacious. We really felt welcome by Owner and Manager,
                  they were very kind and accommodating and provided us nice
                  recommendations on restaurants. Highly recommend staying here
                  for your trip to Anuradhapura!
                </p>
                <div className="testimonial-author">
                  <h4>Berlesu</h4>
                  <p>Rotterdam, Netherlands</p>
                </div>
                <p className="testimonial-date">August 2024</p>
              </div>
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p className="testimonial-text">
                  Had a very clean accomodation with calm environment. It has
                  everything you would expect for the most competitive price. I
                  recommend it 100%. The property owner and manager did
                  everything to feel good here. They are very courteous, honest
                  and helpfull. Thank you Kranda Lodge. Hope to see you all
                  again.
                </p>
                <div className="testimonial-author">
                  <h4>Sayuri</h4>
                  <p>Europe</p>
                </div>
                <p className="testimonial-date">September 2025</p>
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
                  style={{ border: 0, borderRadius: "12px" }}
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
