"use client";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import "./dashboard.css";

type Room = {
  id: string;
  name: string;
  price: number;
  availability: Record<string, boolean>;
};

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("slides");
  const [slides, setSlides] = useState<string[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!sessionStorage.getItem("adminAuth")) {
      router.push("/admin");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    const [slidesRes, galleryRes, roomsRes] = await Promise.all([
      fetch("/api/slides"),
      fetch("/api/gallery"),
      fetch("/api/rooms"),
    ]);
    setSlides((await slidesRes.json()).slides);
    setGallery((await galleryRes.json()).images);
    setRooms((await roomsRes.json()).rooms);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      if (activeTab === "slides") {
        setSlides([...slides, data.path]);
      } else if (activeTab === "gallery") {
        setGallery([
          ...gallery,
          { src: data.path, alt: "Gallery Image", span: "normal" },
        ]);
      }
      alert("Image uploaded! Don't forget to click Save Changes.");
    }
  };

  const addToSlides = (path: string) => {
    setSlides([...slides, path]);
  };

  const removeFromSlides = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const addToGallery = (path: string) => {
    setGallery([
      ...gallery,
      { src: path, alt: "Gallery Image", span: "normal" },
    ]);
  };

  const removeFromGallery = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const saveSlides = async () => {
    await fetch("/api/slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides }),
    });
    alert("Slides saved! Changes will appear on the website.");
  };

  const saveGallery = async () => {
    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: gallery }),
    });
    alert("Gallery saved! Changes will appear on the website.");
  };

  const toggleAvailability = (roomId: string, date: string) => {
    setRooms((prevRooms) => {
      const room = prevRooms.find((r) => r.id === roomId);
      const newBookedState = !room?.availability[date];

      return prevRooms.map((r) => {
        // If toggling villa, update all three rooms
        if (roomId === "villa") {
          if (
            r.id === "villa" ||
            r.id === "family-room" ||
            r.id === "double-room"
          ) {
            return {
              ...r,
              availability: {
                ...r.availability,
                [date]: newBookedState,
              },
            };
          }
        }
        // If toggling family or double room
        else if (roomId === "family-room" || roomId === "double-room") {
          // Update the clicked room
          if (r.id === roomId) {
            return {
              ...r,
              availability: {
                ...r.availability,
                [date]: newBookedState,
              },
            };
          }
          // Update villa based on both rooms' status
          if (r.id === "villa") {
            let villaBooked = false;
            const familyBooked =
              roomId === "family-room"
                ? newBookedState
                : prevRooms.find((rm) => rm.id === "family-room")?.availability[
                    date
                  ] || false;
            const doubleBooked =
              roomId === "double-room"
                ? newBookedState
                : prevRooms.find((rm) => rm.id === "double-room")?.availability[
                    date
                  ] || false;

            villaBooked = familyBooked || doubleBooked;

            return {
              ...r,
              availability: {
                ...r.availability,
                [date]: villaBooked,
              },
            };
          }
        }
        return r;
      });
    });
  };

  const saveRooms = async () => {
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rooms }),
    });
    alert("Room availability saved! Changes will appear on the website.");
  };

  const getDatesForMonth = () => {
    const dates = [];
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      // Format as YYYY-MM-DD without timezone conversion
      const year = currentYear;
      const month = String(currentMonth + 1).padStart(2, "0");
      const day = String(d).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getMonthName = () => {
    return new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button
          className="logout-btn"
          onClick={() => {
            sessionStorage.removeItem("adminAuth");
            router.push("/admin");
          }}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "slides" ? "active" : ""}`}
            onClick={() => setActiveTab("slides")}
          >
            Homepage Slides
          </button>
          <button
            className={`tab ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
          <button
            className={`tab ${activeTab === "availability" ? "active" : ""}`}
            onClick={() => setActiveTab("availability")}
          >
            Room Availability
          </button>
        </div>

        {activeTab === "slides" && (
          <div className="section">
            <h2>Homepage Slideshow</h2>
            <div className="upload-area">
              <label className="file-label">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <div className="image-grid">
              {slides.map((slide, index) => (
                <div key={index} className="image-item">
                  <Image src={slide} alt={`Slide ${index}`} fill />
                  <button
                    className="delete-btn"
                    onClick={() => removeFromSlides(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="save-btn" onClick={saveSlides}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="section">
            <h2>Gallery Images</h2>
            <div className="upload-area">
              <label className="file-label">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <div className="image-grid">
              {gallery.map((img, index) => (
                <div key={index} className="image-item">
                  <Image src={img.src} alt={img.alt} fill />
                  <button
                    className="delete-btn"
                    onClick={() => removeFromGallery(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button className="save-btn" onClick={saveGallery}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "availability" && (
          <div className="section">
            <h2>Room Availability</h2>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              style={{ padding: "0.5rem", marginBottom: "1rem", width: "100%" }}
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>

            {selectedRoom && (
              <>
                <div className="month-navigation">
                  <button className="nav-btn" onClick={goToPreviousMonth}>
                    ← Previous
                  </button>
                  <h3 className="current-month">{getMonthName()}</h3>
                  <button className="nav-btn" onClick={goToNextMonth}>
                    Next →
                  </button>
                </div>
                <div className="calendar-header">
                  <div className="weekday-label">Sun</div>
                  <div className="weekday-label">Mon</div>
                  <div className="weekday-label">Tue</div>
                  <div className="weekday-label">Wed</div>
                  <div className="weekday-label">Thu</div>
                  <div className="weekday-label">Fri</div>
                  <div className="weekday-label">Sat</div>
                </div>
                <div className="calendar">
                  {/* Empty cells for days before the 1st */}
                  {Array.from({
                    length: new Date(currentYear, currentMonth, 1).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="day empty"></div>
                  ))}
                  {getDatesForMonth().map((date) => {
                    const room = rooms.find((r) => r.id === selectedRoom);
                    const isBooked = room?.availability[date];
                    // Parse date parts to avoid timezone issues
                    const [year, month, day] = date.split("-").map(Number);

                    return (
                      <div
                        key={date}
                        className={`day ${isBooked ? "booked" : "available"}`}
                        onClick={() => toggleAvailability(selectedRoom, date)}
                      >
                        <span className="day-number">{day}</span>
                        <small>{isBooked ? "Booked" : "Available"}</small>
                      </div>
                    );
                  })}
                </div>
                <button className="save-btn" onClick={saveRooms}>
                  Save Availability
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
