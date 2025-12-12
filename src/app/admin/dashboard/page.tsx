"use client";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import "./dashboard.css";

type Room = {
  id: string;
  name: string;
  price: number | string;
  capacity?: number;
  guests?: string;
  beds?: string;
  description?: string;
  images?: string[];
  cardImage?: string;
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
    try {
      const [slidesRes, galleryRes, roomsRes] = await Promise.all([
        fetch("/api/slides?t=" + Date.now()),
        fetch("/api/gallery?t=" + Date.now()),
        fetch("/api/rooms?t=" + Date.now()),
      ]);
      const slidesData = await slidesRes.json();
      const galleryData = await galleryRes.json();
      const roomsData = await roomsRes.json();

      // Extract URLs from slides, handling nested objects
      const extractedSlides = (slidesData.slides || [])
        .map((slide: any) => {
          let url = slide;
          // Keep drilling down until we get a string
          while (url && typeof url === "object") {
            url = url.url || url.src || url;
            if (typeof url === "object" && url.url === url) break; // Prevent infinite loop
          }
          return typeof url === "string" ? url : null;
        })
        .filter((url: any) => url && url.length > 0);
      setSlides(extractedSlides);
      // Gallery API returns { images: [...] } format
      if (galleryData.images) {
        setGallery(galleryData.images);
      } else if (Array.isArray(galleryData)) {
        setGallery(
          galleryData.map((img: any) => ({
            src: img.url || img.src,
            alt: img.description || "Gallery Image",
            span: "normal",
            _id: img._id,
          }))
        );
      } else {
        setGallery([]);
      }
      // Ensure all rooms have availability object
      const roomsWithAvailability = (roomsData.rooms || []).map(
        (room: Room) => ({
          ...room,
          availability: room.availability || {},
        })
      );
      setRooms(roomsWithAvailability);
    } catch (error) {
      console.error("Error loading data:", error);
      setGallery([]);
      setSlides([]);
      setRooms([]);
    }
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
        alert("Image uploaded! Don't forget to click Save Changes.");
      } else if (activeTab === "gallery") {
        // Auto-save to database for gallery
        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: data.path.split("/").pop(),
            path: data.path,
            url: data.path,
            category: "gallery",
            description: "Gallery Image",
          }),
        });
        await loadData(); // Reload to get the new image with _id
        alert("Image uploaded and saved!");
      }
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

  const removeFromGallery = async (index: number) => {
    const imageToDelete = gallery[index];

    // If the image has an _id, delete it from the database
    if (imageToDelete && imageToDelete._id) {
      try {
        await fetch(`/api/gallery?id=${imageToDelete._id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting from database:", error);
      }
    }

    // Remove from local state
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
    try {
      // Only save new items (without _id)
      const newImages = gallery.filter((img) => !img._id && img.src);

      for (const img of newImages) {
        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: img.src.split("/").pop(),
            path: img.src,
            url: img.src,
            category: "gallery",
            description: img.alt,
          }),
        });
      }

      // Reload to get updated data with _ids
      await loadData();
      alert("Gallery saved!");
    } catch (error) {
      console.error("Error saving gallery:", error);
      alert("Failed to save gallery");
    }
  };

  const toggleAvailability = (roomId: string, date: string) => {
    setRooms((prevRooms) => {
      const room = prevRooms.find((r) => r.id === roomId);
      const currentState = room?.availability?.[date];
      const newBookedState = !currentState;

      return prevRooms.map((r) => {
        // If booking Villa, also book Double Room and Family Room
        if (roomId === "villa") {
          if (
            r.id === "villa" ||
            r.id === "double-room" ||
            r.id === "family-room"
          ) {
            return {
              ...r,
              availability: {
                ...(r.availability || {}),
                [date]: newBookedState,
              },
            };
          }
          return r;
        }
        // For Double Room or Family Room, only update that specific room
        if (r.id === roomId) {
          return {
            ...r,
            availability: {
              ...(r.availability || {}),
              [date]: newBookedState,
            },
          };
        }
        return r;
      });
    });
  };

  const saveRooms = async () => {
    try {
      console.log("Saving rooms:", rooms);
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rooms }),
      });

      const data = await response.json();
      console.log("Save response:", response.status, data);

      if (response.ok && data.success) {
        // Reload the rooms data to ensure consistency
        const reloadRes = await fetch("/api/rooms?t=" + Date.now());
        const reloadData = await reloadRes.json();
        if (reloadData.rooms) {
          setRooms(reloadData.rooms);
        }
        alert("Room availability saved!");
      } else {
        console.error("Save failed:", data);
        alert("Error saving: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving rooms:", error);
      alert("Network error. Please check your connection.");
    }
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
              {(slides || [])
                .filter((slide: string) => slide && slide.length > 0)
                .map((slideUrl: string, index: number) => (
                  <div key={index} className="image-item">
                    <Image src={slideUrl} alt={`Slide ${index}`} fill />
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
              {(gallery || [])
                .filter((img) => img.src && img.src.trim())
                .map((img, index) => (
                  <div key={index} className="image-item">
                    <Image
                      src={img.src}
                      alt={img.alt || "Gallery Image"}
                      fill
                    />
                    <button
                      className="delete-btn"
                      onClick={() => removeFromGallery(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
            </div>
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
                    const isBooked = room?.availability?.[date] === true;
                    // Parse date parts to avoid timezone issues
                    const [year, month, day] = date.split("-").map(Number);

                    // Check if date is in the past
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dateObj = new Date(year, month - 1, day);
                    const isPast = dateObj < today;

                    return (
                      <div
                        key={date}
                        className={`day ${isBooked ? "booked" : "available"} ${
                          isPast ? "past" : ""
                        }`}
                        onClick={() =>
                          !isPast && toggleAvailability(selectedRoom, date)
                        }
                        style={{
                          cursor: isPast ? "not-allowed" : "pointer",
                          opacity: isPast ? 0.5 : 1,
                        }}
                      >
                        <span className="day-number">{day}</span>
                        <small>
                          {isBooked ? "Booked" : isPast ? "Past" : "Available"}
                        </small>
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
