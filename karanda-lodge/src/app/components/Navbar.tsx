"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <ul className="nav-links">
          <li>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/Rooms" className={pathname === "/Rooms" ? "active" : ""}>
              Rooms
            </Link>
          </li>
          <li>
            <Link href="/Booking" className={pathname === "/Booking" ? "active" : ""}>
              Booking
            </Link>
          </li>
          <li>
            <Link href="/Gallery" className={pathname === "/Gallery" ? "active" : ""}>
              Gallery
            </Link>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
