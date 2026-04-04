"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import "./WelcomeScreen.css";

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show once per session
    const hasSeenWelcome = sessionStorage.getItem("karanda_welcome_seen");
    if (!hasSeenWelcome) {
      setVisible(true);
      // Lock body scroll while welcome is showing
      document.body.style.overflow = "hidden";
    }
  }, []);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    sessionStorage.setItem("karanda_welcome_seen", "true");
    // Wait for exit animation to complete
    setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "unset";
    }, 800);
  }, [exiting]);

  useEffect(() => {
    if (!visible || exiting) return;
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, exiting, dismiss]);

  // Keyboard: Enter or Escape to dismiss
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, dismiss]);

  // Focus trap
  useEffect(() => {
    if (visible && containerRef.current) {
      containerRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className={`welcome-overlay ${exiting ? "welcome-exit" : ""}`}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Karanda Lodge"
      tabIndex={-1}
    >
      {/* Ambient background particles */}
      <div className="welcome-particles" aria-hidden="true">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
      </div>

      <div className="welcome-content">
        {/* Logo with glow ring */}
        <div className="welcome-logo-wrapper">
          <div className="welcome-logo-glow" aria-hidden="true" />
          <div className="welcome-logo-ring" aria-hidden="true" />
          <div className="welcome-logo-ring-2" aria-hidden="true" />
          <Image
            src="/logo.png"
            alt="Karanda Lodge Logo"
            width={180}
            height={180}
            className="welcome-logo"
            priority
          />
        </div>

        {/* Text */}
        <h1 className="welcome-title">Karanda Lodge</h1>
        <div className="welcome-divider" aria-hidden="true" />
        <p className="welcome-tagline">
          Your Sanctuary in Nature
        </p>
        <p className="welcome-location">
          Anuradhapura, Sri Lanka
        </p>

        {/* Subtle enter hint */}
        <span className="welcome-hint">
          Click anywhere or press Enter to continue
          <span className="welcome-hint-arrow">↓</span>
        </span>
      </div>
    </div>
  );
}
