"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import "../home.css";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
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

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Overlay */}
        <div
          className={`nav-overlay ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <li>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/Rooms"
              className={pathname === "/Rooms" ? "active" : ""}
            >
              Rooms
            </Link>
          </li>
          <li>
            <Link
              href="/Booking"
              className={pathname === "/Booking" ? "active" : ""}
            >
              Booking
            </Link>
          </li>
          <li>
            <Link
              href="/Gallery"
              className={pathname === "/Gallery" ? "active" : ""}
            >
              Gallery
            </Link>
          </li>
          <li>
            <Link
              href="/About"
              className={pathname === "/About" ? "active" : ""}
            >
              About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
