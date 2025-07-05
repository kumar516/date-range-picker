import React, { useState, useEffect, useRef } from "react";
import { format, toZonedTime } from "date-fns-tz";
import "./DateRangePicker.css";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

const timezones = [
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "UTC", value: "UTC" },
  { label: "US East (EST)", value: "America/New_York" },
  { label: "London (BST/GMT)", value: "Europe/London" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Moscow (MSK)", value: "Europe/Moscow" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function generateCalendar(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = getDaysInMonth(year, month);
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  return days;
}

export default function DateRangePicker({ setMainDate }) {
  const maxRangeDays = 10;
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });
  const [tempRange, setTempRange] = useState({ start: null, end: null });
  const [inputValue, setInputValue] = useState("");
  const [timezone, setTimezone] = useState("Europe/Moscow");
  const localTimeZone = "Asia/Kolkata";
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const calendarRef = useRef();
  const specialDates = [
    { date: "2025-07-10", message: "Public Holiday" },
    { date: "2025-07-15", message: "Maintenance Window" },
    { date: "2025-07-20", message: "System Upgrade" },
  ];

  useEffect(() => {
    setMainDate(selectedRange);
  }, [selectedRange]);

  const handleDateClick = (day) => {
    if (!day) return;
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (!tempRange.start || tempRange.end) {
      setTempRange({ start: selectedDate, end: null });
      setTooltip(null);
    } else {
      const dayDiff = Math.abs(
        (selectedDate - tempRange.start) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff > maxRangeDays - 1) {
        return;
      }
      if (selectedDate < tempRange.start) {
        setTempRange({ start: selectedDate, end: tempRange.start });
      } else {
        setTempRange({ ...tempRange, end: selectedDate });
      }
      setTooltip(null);
    }
  };

  const formatDisplayRange = (start, end, tz) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: tz,
    };
    const offset = new Date()
      .toLocaleTimeString("en-us", { timeZone: tz, timeZoneName: "short" })
      .split(" ")
      .pop();
    const startStr = new Intl.DateTimeFormat("en-GB", options).format(
      toZonedTime(start, tz)
    );
    const endStr = new Intl.DateTimeFormat("en-GB", options).format(
      toZonedTime(end, tz)
    );
    return `${startStr} - ${endStr} ${offset}`;
  };

  useEffect(() => {
    if (selectedRange.start && selectedRange.end) {
      const label = formatDisplayRange(
        selectedRange.start,
        selectedRange.end,
        timezone
      );
      setInputValue(label);
    }
  }, [timezone]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
        setTooltip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calendarDays = generateCalendar(currentYear, currentMonth);

  const getMessageForDate = (date) => {
    const iso = format(date, "yyyy-MM-dd");
    const match = specialDates.find((entry) => entry.date === iso);
    return match?.message || null;
  };

  return (
    <div className="date-range-container" ref={calendarRef}>
      <div className="date-range-input-container">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="timezone-dropdown"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <div
          className="date-range-input-value"
          onClick={() => {
            setTempRange({ ...selectedRange });
            if (selectedRange.start) {
              const startDate = selectedRange.start;
              setCurrentMonth(startDate.getMonth());
              setCurrentYear(startDate.getFullYear());
            }
            setShowCalendar((prev) => !prev);
          }}
        >
          <input
            readOnly
            value={inputValue}
            placeholder="Select date range"
            className="date-input"
          />
          <DateRangeIcon className="date-range-icon" />
        </div>
      </div>
      {showCalendar && (
        <div className="calendar">
          <div className="calendar-header">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
            >
              <ArrowLeftIcon className="arrow-icon" />
            </button>
            <div>
              {new Date(currentYear, currentMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
            >
              <ArrowRightIcon className="arrow-icon" />
            </button>
          </div>
          {tooltip && tooltipPos && (
            <div
              className="tooltip-warning"
              style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
              {tooltip}
            </div>
          )}
          <div className="calendar-grid">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="day-label">
                {d}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              const thisDate = day
                ? new Date(currentYear, currentMonth, day)
                : null;
              const isStart =
                thisDate?.getTime() === tempRange.start?.getTime();
              const isEnd = thisDate?.getTime() === tempRange.end?.getTime();
              const isInRange =
                thisDate &&
                tempRange.start &&
                tempRange.end &&
                thisDate >= tempRange.start &&
                thisDate <= tempRange.end;
              const hoveredTargetDate = hoveredDate
                ? new Date(currentYear, currentMonth, hoveredDate)
                : null;
              const isInPreviewRange =
                thisDate &&
                tempRange.start &&
                !tempRange.end &&
                hoveredTargetDate &&
                ((thisDate >= tempRange.start &&
                  thisDate <= hoveredTargetDate) ||
                  (thisDate <= tempRange.start &&
                    thisDate >= hoveredTargetDate));
              const isOnlyStart =
                thisDate &&
                tempRange.start &&
                !tempRange.end &&
                thisDate.getTime() === tempRange.start.getTime();
              const isOnlyEnd =
                thisDate &&
                tempRange.end &&
                !tempRange.start &&
                thisDate.getTime() === tempRange.end.getTime();
              const hasMessage = thisDate && getMessageForDate(thisDate);
              return (
                <div
                  key={idx}
                  className={`calendar-cell ${day ? "active" : "empty"} 
  ${isInRange ? "in-range" : ""} 
  ${isStart ? "range-start" : ""} 
  ${isEnd ? "range-end" : ""} 
  ${isOnlyStart || isOnlyEnd ? "selected-only" : ""} 
  ${isInPreviewRange ? "hovered" : ""} ${hasMessage ? "has-message" : ""}`}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={(e) => {
                    setHoveredDate(day);
                    if (!day) {
                      setTooltip(null);
                      return;
                    }

                    const hoveredDate = new Date(
                      currentYear,
                      currentMonth,
                      day
                    );
                    const msg = getMessageForDate(hoveredDate);
                    const cellRect = e.target.getBoundingClientRect();
                    if (tempRange.start && !tempRange.end) {
                      const diffInDays = Math.abs(
                        Math.floor(
                          (hoveredDate - tempRange.start) /
                            (1000 * 60 * 60 * 24)
                        )
                      );

                      if (diffInDays >= maxRangeDays) {
                        setTooltip("Max 10 days");
                        setTooltipPos({
                          top: cellRect.top + window.scrollY - 30,
                          left: cellRect.left - 160 + cellRect.width / 2,
                        });
                        return;
                      }
                    }
                    if (msg) {
                      setTooltip(msg);
                      setTooltipPos({
                        top: cellRect.top + window.scrollY - 30,
                        left: cellRect.left - 160 + cellRect.width / 2,
                      });
                    } else {
                      setTooltip(null);
                    }
                  }}
                >
                  {day || ""}
                  {hasMessage && <span className="message-dot">*</span>}
                </div>
              );
            })}
          </div>
          {(tempRange.start || tempRange.end) && (
            <div className="calendar-current-selection">
              {tempRange.start &&
                toZonedTime(tempRange.start, localTimeZone).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: localTimeZone,
                  }
                )}
              {tempRange.start && tempRange.end && " - "}
              {tempRange.end &&
                toZonedTime(tempRange.end, localTimeZone).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: localTimeZone,
                  }
                )}
            </div>
          )}
          <div className="calendar-footer">
            <button
              className="cancel-button"
              onClick={() => {
                setTempRange(selectedRange);
                setShowCalendar(false);
              }}
            >
              Cancel
            </button>
            <button
              className="go-button"
              onClick={() => {
                if (tempRange.start && tempRange.end) {
                  setSelectedRange(tempRange);
                  const label = formatDisplayRange(
                    tempRange.start,
                    tempRange.end,
                    timezone
                  );
                  setInputValue(label);
                  setShowCalendar(false);
                }
              }}
            >
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
