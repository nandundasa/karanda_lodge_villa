"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./gallery.css";

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [images, setImages] = useState<any[]>([]);

  // Filter out images with empty src
  const validImages = images.filter(
    (image) => image.src && image.src.length > 0
  );

  useEffect(() => {
    const loadGallery = () => {
      fetch("/api/gallery?t=" + Date.now())
        .then((res) => res.json())
        .then((data) => {
          if (data.images && data.images.length > 0) {
            setImages(data.images);
          }
        })
        .catch((err) => console.error("Error loading gallery:", err));
    };
    loadGallery();
    const interval = setInterval(loadGallery, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="gallery-page">
        <div className="gallery-grid">
          {validImages.map((image, index) => (
            <div
              key={index}
              className={`gallery-item ${image.span || "normal"}`}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt || "Gallery Image"}
                fill
                className="gallery-image"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {selectedIndex !== null && validImages[selectedIndex] && (
          <div className="modal" onClick={() => setSelectedIndex(null)}>
            <button
              className="modal-close"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={32} />
            </button>
            <button
              className="modal-nav prev"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(
                  (selectedIndex - 1 + validImages.length) % validImages.length
                );
              }}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="modal-nav next"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((selectedIndex + 1) % validImages.length);
              }}
            >
              <ChevronRight size={32} />
            </button>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <Image
                src={validImages[selectedIndex].src}
                alt={validImages[selectedIndex].alt || "Gallery Image"}
                width={1920}
                height={1080}
                className="modal-image"
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
