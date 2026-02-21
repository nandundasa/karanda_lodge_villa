"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./booking.css";

type Room = {
  id: string;
  name: string;
  price: number;
  availability: Record<string, boolean>;
};

interface CalendarProps {
  title: string;
  roomType: "family" | "double" | "villa";
  bookedDates: string[];
  selectedDates: string[];
  onDateClick: (dateStr: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

function Calendar({
  title,
  roomType,
  bookedDates,
  selectedDates,
  onDateClick,
  currentMonth,
  onMonthChange,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const getDateString = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const isPastDate = (day: number) => {
    const dateToCheck = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return dateToCheck < today;
  };

  const getDayClass = (day: number) => {
    const dateStr = getDateString(day);
    if (isPastDate(day)) return "past";
    if (selectedDates.includes(dateStr)) return "selected";
    if (bookedDates.includes(dateStr)) return "booked";
    return "available";
  };

  return (
    <div className="calendar-card">
      <h2 className="calendar-title">{title}</h2>
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">
          <ChevronLeft size={20} />
        </button>
        <span className="month-year">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={nextMonth} className="nav-btn">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar-grid">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="day empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = getDateString(day);
          return (
            <div
              key={day}
              className={`day ${getDayClass(day)}`}
              onClick={() => onDateClick(dateStr)}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

export default function Booking() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [familySelected, setFamilySelected] = useState<string[]>([]);
  const [doubleSelected, setDoubleSelected] = useState<string[]>([]);
  const [villaSelected, setVillaSelected] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const loadRooms = async () => {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    };
    loadRooms();
  }, []);

  const getBookedDates = (roomId: string): string[] => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || !room.availability) return [];
    return Object.entries(room.availability)
      .filter(([_, isBooked]) => isBooked === true)
      .map(([date]) => date);
  };

  const familyBooked = getBookedDates("family-room");
  const doubleBooked = getBookedDates("double-room");
  const villaBooked = getBookedDates("villa");

  const isPastDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(dateStr);
    return dateToCheck < today;
  };

  const handleFamilyClick = (dateStr: string) => {
    if (
      isPastDate(dateStr) ||
      familyBooked.includes(dateStr) ||
      villaBooked.includes(dateStr)
    )
      return;
    setFamilySelected((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleDoubleClick = (dateStr: string) => {
    if (
      isPastDate(dateStr) ||
      doubleBooked.includes(dateStr) ||
      villaBooked.includes(dateStr)
    )
      return;
    setDoubleSelected((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleVillaClick = (dateStr: string) => {
    if (
      isPastDate(dateStr) ||
      familyBooked.includes(dateStr) ||
      doubleBooked.includes(dateStr) ||
      villaBooked.includes(dateStr)
    )
      return;
    setVillaSelected((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const getVillaBookedDates = () => {
    return [...new Set([...familyBooked, ...doubleBooked, ...villaBooked])];
  };

  return (
    <>
      <Navbar />
      <main className="booking-page">
        <div className="calendars-container">
          <Calendar
            title="Family Room"
            roomType="family"
            bookedDates={[...familyBooked, ...villaBooked]}
            selectedDates={familySelected}
            onDateClick={handleFamilyClick}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
          <Calendar
            title="Double Room"
            roomType="double"
            bookedDates={[...doubleBooked, ...villaBooked]}
            selectedDates={doubleSelected}
            onDateClick={handleDoubleClick}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
          <Calendar
            title="Entire Villa"
            roomType="villa"
            bookedDates={getVillaBookedDates()}
            selectedDates={villaSelected}
            onDateClick={handleVillaClick}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
        <div className="villa-info">
          <div className="info-icon">🏡</div>
          <h3>Book the Entire Villa</h3>
          <p>
            The entire villa includes both the Family Room and the Double Room. When you book the villa, the entire property is reserved exclusively for you, including both rooms and all common areas. If either room is already booked, the entire villa cannot be reserved for that date.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
