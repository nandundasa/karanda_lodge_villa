import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <Image src="/logo.png" alt="Karanda Lodge" width={40} height={40} />
            <span>Karanda Lodge</span>
          </div>
          <p className="footer-description">
            Experience nature&apos;s tranquility at Karanda Lodge. Your perfect
            escape surrounded by lush greenery.
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
  );
}
