"use client";
import { Leaf } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./about.css";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="about-page">
        <div className="about-content">
          <div className="story-section">
            <h1>Our Story</h1>
            <p>
              Nestled in the heart of lush greenery, Karanda Lodge was born from
              a dream to create a sanctuary where nature and comfort exist in
              perfect harmony. Our journey began with a single majestic Karanda
              tree, which stands as a symbol of growth, strength, and natural
              beauty.
            </p>
            <p>
              For over a decade, we have welcomed guests from around the world,
              offering them a peaceful retreat from the hustle of daily life.
              Each room, each pathway, and each moment at Karanda Lodge is
              designed to reconnect you with the tranquility of nature.
            </p>
            <p>
              Our commitment to sustainable tourism and eco-friendly practices
              ensures that the beauty we enjoy today will be preserved for
              generations to come. We believe in creating memories that last a
              lifetime while respecting and protecting our natural environment.
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
              sustenance. Just like this magnificent tree, Karanda Lodge offers
              a safe haven for travelers seeking rest, rejuvenation, and
              connection with nature.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
