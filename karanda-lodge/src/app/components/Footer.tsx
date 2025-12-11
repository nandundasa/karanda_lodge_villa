import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import "../home.css";

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
            <a
              href="https://www.facebook.com/share/181Mh5eVQP/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/karanda.lodge?igsh=NDNwdmljNjVoemlh&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.tiktok.com/@karanda.lodge?_r=1&_t=ZS-926Lq8muVux"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tiktok"
            >
              <SiTiktok size={20} />
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
            <span>No.581/113A, Rathanasara Mawatha, Anuradhapura</span>
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
