"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/home/Hero";
import StaysSection from "./components/home/StaysSection";
import Testimonials from "./components/home/Testimonials";
import SocialSection from "./components/home/SocialSection";

type RoomSummary = { id: string; price?: number | string };

/** Slides may be stored as strings or (possibly nested) { url | src } objects. */
function slideUrl(slide: unknown): string | null {
  let value = slide;
  for (let depth = 0; depth < 5 && value && typeof value === "object"; depth++) {
    const o = value as { url?: unknown; src?: unknown };
    value = o.url ?? o.src;
  }
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default function Home() {
  const [slides, setSlides] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await fetch("/api/slides?t=" + Date.now());
        const data = await res.json();
        const formattedSlides: string[] = (Array.isArray(data.slides) ? data.slides : [])
          .map(slideUrl)
          .filter((u: string | null): u is string => u !== null);
        if (formattedSlides.length > 0) {
          setSlides(formattedSlides);
          
          // Preload first 3 images
          formattedSlides.slice(0, 3).forEach((src: string) => {
            const img = new window.Image();
            img.src = src;
          });
          
        } else {
          // Fallback to hardcoded WebP slides
          const fallbackSlides = [
            '/IMG_0922.webp',
            '/IMG_9527.webp',
            '/IMG_2255.webp',
            '/IMG_8574.webp',
            '/IMG_9537.webp'
          ];
          setSlides(fallbackSlides);
        }
      } catch (err) {
        console.error("Error loading slides:", err);
        // Fallback to hardcoded WebP slides
        const fallbackSlides = [
          '/IMG_0922.webp',
          '/IMG_9527.webp',
          '/IMG_2255.webp',
          '/IMG_8574.webp',
          '/IMG_9537.webp'
        ];
        setSlides(fallbackSlides);
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

  // Lowest numeric nightly price, e.g. "6,000" (prices may be ranges like "7000-8000")
  const startingPrice = (() => {
    const nums = rooms
      .map((r) => parseInt(String(r.price ?? "").replace(/,/g, ""), 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    return nums.length ? Math.min(...nums).toLocaleString("en-US") : "6,000";
  })();

  return (
    <>
      <Navbar />

      <Hero slides={slides} startingPrice={startingPrice} />

      <StaysSection rooms={rooms} />

      <Testimonials />
      <SocialSection />

      <Footer />
    </>
  );
}
