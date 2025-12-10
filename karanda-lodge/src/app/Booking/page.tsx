"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./booking.css";

interface CalendarProps {
  title: string;
  price: string;
  roomType: "family" | "double" | "villa";
  bookedDates: number[];
  selectedDates: number[];
  onDateClick: (day: number) => void;
}

function Calendar({ title, price, roomType, bookedDates, selectedDates, onDateClick }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentDate, setCurrentDate] = useState(today);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
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
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };



  const isPastDate = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dateToCheck < today;
  };

  const getDayClass = (day: number) => {
    if (isPastDate(day)) return "past";
    if (selectedDates.includes(day)) return "selected";
    if (bookedDates.includes(day)) return "booked";
    return "available";
  };

  return (
    <div className="calendar-card">
      <h2 className="calendar-title">
        {title} - {price}
      </h2>
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">
          <ChevronLeft size={20} />
        </button>
        <span className="month-year">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
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
          return (
            <div
              key={day}
              className={`day ${getDayClass(day)}`}
              onClick={() => onDateClick(day)}
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
  const [familyBooked, setFamilyBooked] = useState<number[]>([15, 16]);
  const [doubleBooked, setDoubleBooked] = useState<number[]>([21, 24]);
  const [villaBooked, setVillaBooked] = useState<number[]>([25, 31]);
  const [familySelected, setFamilySelected] = useState<number[]>([]);
  const [doubleSelected, setDoubleSelected] = useState<number[]>([]);
  const [villaSelected, setVillaSelected] = useState<number[]>([]);

  const isPastDate = (day: number, month: number, year: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(year, month, day);
    return dateToCheck < today;
  };

  const handleFamilyClick = (day: number) => {
    if (isPastDate(day, new Date().getMonth(), new Date().getFullYear()) || familyBooked.includes(day) || villaBooked.includes(day)) return;
    setFamilySelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDoubleClick = (day: number) => {
    if (isPastDate(day, new Date().getMonth(), new Date().getFullYear()) || doubleBooked.includes(day) || villaBooked.includes(day)) return;
    setDoubleSelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleVillaClick = (day: number) => {
    if (isPastDate(day, new Date().getMonth(), new Date().getFullYear()) || familyBooked.includes(day) || doubleBooked.includes(day) || villaBooked.includes(day)) return;
    setVillaSelected((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
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
            price="$150/night" 
            roomType="family"
            bookedDates={[...familyBooked, ...villaBooked]}
            selectedDates={familySelected}
            onDateClick={handleFamilyClick}
          />
          <Calendar 
            title="Double Room" 
            price="$120/night" 
            roomType="double"
            bookedDates={[...doubleBooked, ...villaBooked]}
            selectedDates={doubleSelected}
            onDateClick={handleDoubleClick}
          />
          <Calendar 
            title="Entire Villa" 
            price="$270/night" 
            roomType="villa"
            bookedDates={getVillaBookedDates()}
            selectedDates={villaSelected}
            onDateClick={handleVillaClick}
          />
        </div>
        <div className="villa-info">
          <div className="info-icon">🏡</div>
          <h3>Book the Entire Villa</h3>
          <p>
            The entire villa includes both the Family Room and Double Room. When
            you book the villa, both rooms are reserved exclusively for you. If
            either room is already booked, the entire villa cannot be reserved
            for that date.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
