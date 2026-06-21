"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Clock as ClockIcon } from "lucide-react";

interface MaterialTimePickerProps {
  open: boolean;
  value: string; // "HH:MM" in 24h format
  onChange: (val: string) => void;
  onClose: () => void;
}

// Helpers for time conversion
const parseTime = (timeStr: string) => {
  const [hStr, mStr] = timeStr.split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;

  let ampm: "AM" | "PM" = "AM";
  let hour = h24;

  if (h24 >= 12) {
    ampm = "PM";
    if (h24 > 12) {
      hour = h24 - 12;
    }
  } else if (h24 === 0) {
    hour = 12;
  }

  return { hour, minute, ampm };
};

const formatTime24 = (hour: number, minute: number, ampm: "AM" | "PM") => {
  let h24 = hour;
  if (ampm === "PM") {
    if (hour < 12) {
      h24 = hour + 12;
    }
  } else {
    if (hour === 12) {
      h24 = 0;
    }
  }
  return `${h24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

export function MaterialTimePicker({ open, value, onChange, onClose }: MaterialTimePickerProps) {
  const dialRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [keyboardInput, setKeyboardInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard text states
  const [hourText, setHourText] = useState("08");
  const [minuteText, setMinuteText] = useState("00");

  // Load initial value
  useEffect(() => {
    if (open && value) {
      const { hour, minute, ampm: parsedAmpm } = parseTime(value);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setAmpm(parsedAmpm);
      setHourText(hour.toString().padStart(2, "0"));
      setMinuteText(minute.toString().padStart(2, "0"));
      setMode("hour");
      setKeyboardInput(false);
    }
  }, [open, value]);

  // Sync text inputs with selections
  useEffect(() => {
    setHourText(selectedHour.toString().padStart(2, "0"));
  }, [selectedHour]);

  useEffect(() => {
    setMinuteText(selectedMinute.toString().padStart(2, "0"));
  }, [selectedMinute]);

  // Position calculation for dial numbers
  const getDialPosition = (index: number) => {
    const R = 92; // Radius in pixels
    // Angle in radians (index goes 1-12 for hours, 0-11 for minutes representing 0-55)
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const x = 120 + R * Math.cos(angle);
    const y = 120 + R * Math.sin(angle);
    return { left: `${x}px`, top: `${y}px` };
  };

  // Drag and click handlers on clock dial
  const updateValueFromCoords = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);
    let deg = (angleDeg + 90 + 360) % 360;

    if (mode === "hour") {
      let hr = Math.round(deg / 30);
      if (hr === 0) hr = 12;
      setSelectedHour(hr);
    } else {
      let min = Math.round(deg / 6) % 60;
      setSelectedMinute(min);
    }
  };

  const handleDialMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValueFromCoords(e.clientX, e.clientY);
  };

  const handleDialTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      updateValueFromCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Listen to drag events globally
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValueFromCoords(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Auto switch to minutes after selecting hour
      if (mode === "hour") {
        setTimeout(() => setMode("minute"), 200);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateValueFromCoords(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (mode === "hour") {
        setTimeout(() => setMode("minute"), 200);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, mode]);

  // Submit selections
  const handleSave = () => {
    let finalHour = selectedHour;
    let finalMinute = selectedMinute;

    if (keyboardInput) {
      const hr = parseInt(hourText, 10);
      const mn = parseInt(minuteText, 10);

      if (isNaN(hr) || hr < 1 || hr > 12) {
        alert("Hours must be between 1 and 12.");
        return;
      }
      if (isNaN(mn) || mn < 0 || mn > 59) {
        alert("Minutes must be between 0 and 59.");
        return;
      }

      finalHour = hr;
      finalMinute = mn;
    }

    const val24 = formatTime24(finalHour, finalMinute, ampm);
    onChange(val24);
    onClose();
  };

  // Dial angles for rendering the clock hand
  const currentAngle = mode === "hour" ? selectedHour * 30 : selectedMinute * 6;

  // Minutes values (00, 05, ..., 55)
  const minutesValues = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.15 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-card border border-border w-full max-w-[328px] rounded-[28px] p-6 shadow-2xl pointer-events-auto flex flex-col items-center">
              {/* Header Label */}
              <div className="w-full text-left text-[12px] font-medium tracking-[1.5px] text-muted-foreground uppercase mb-4">
                Select Time
              </div>

              {/* Digital Display Row */}
              <div className="flex items-center justify-center gap-3 mb-6 w-full">
                {/* Hours Box */}
                {keyboardInput ? (
                  <input
                    type="text"
                    value={hourText}
                    onChange={(e) => setHourText(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="w-[96px] h-[80px] rounded-lg bg-muted text-center text-[56px] font-medium leading-[80px] outline-none border border-transparent focus:border-primary/50 text-foreground"
                    maxLength={2}
                  />
                ) : (
                  <button
                    onClick={() => setMode("hour")}
                    className={`w-[96px] h-[80px] rounded-lg text-center text-[56px] font-medium leading-[80px] transition-colors ${
                      mode === "hour"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {selectedHour.toString().padStart(2, "0")}
                  </button>
                )}

                {/* Colon Separator */}
                <div className="text-[56px] font-medium leading-[80px] text-foreground">:</div>

                {/* Minutes Box */}
                {keyboardInput ? (
                  <input
                    type="text"
                    value={minuteText}
                    onChange={(e) => setMinuteText(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    className="w-[96px] h-[80px] rounded-lg bg-muted text-center text-[56px] font-medium leading-[80px] outline-none border border-transparent focus:border-primary/50 text-foreground"
                    maxLength={2}
                  />
                ) : (
                  <button
                    onClick={() => setMode("minute")}
                    className={`w-[96px] h-[80px] rounded-lg text-center text-[56px] font-medium leading-[80px] transition-colors ${
                      mode === "minute"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {selectedMinute.toString().padStart(2, "0")}
                  </button>
                )}

                {/* AM / PM Toggle buttons */}
                <div className="flex flex-col border border-border rounded-lg overflow-hidden h-[80px] w-[52px]">
                  <button
                    onClick={() => setAmpm("AM")}
                    className={`flex-1 text-[14px] font-semibold transition-colors ${
                      ampm === "AM"
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    AM
                  </button>
                  <div className="h-[1px] w-full bg-border" />
                  <button
                    onClick={() => setAmpm("PM")}
                    className={`flex-1 text-[14px] font-semibold transition-colors ${
                      ampm === "PM"
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Dial mode or Keyboard Input mode */}
              {!keyboardInput ? (
                /* Clock dial container */
                <div
                  ref={dialRef}
                  onMouseDown={handleDialMouseDown}
                  onTouchStart={handleDialTouchStart}
                  className="w-[240px] h-[240px] rounded-full bg-muted/60 relative select-none cursor-pointer mb-6 touch-none"
                >
                  {/* Center Dot */}
                  <div className="w-[8px] h-[8px] rounded-full bg-primary absolute left-[116px] top-[116px]" />

                  {/* Clock Hand Pointer */}
                  <div
                    className="absolute w-[2px] bg-primary origin-bottom left-[119px] bottom-[120px] transition-transform duration-75"
                    style={{
                      height: "84px",
                      transform: `rotate(${currentAngle}deg)`,
                    }}
                  >
                    {/* Small dot on the end of the line */}
                    <div className="w-[4px] h-[4px] rounded-full bg-primary absolute -left-[1px] -top-[2px]" />
                  </div>

                  {/* Circular selector wrapper around the selected digit */}
                  <div
                    className="w-[36px] h-[36px] bg-primary rounded-full absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none flex items-center justify-center text-primary-foreground font-semibold text-[14px]"
                    style={{
                      left: `${120 + 92 * Math.cos((currentAngle - 90) * (Math.PI / 180))}px`,
                      top: `${120 + 92 * Math.sin((currentAngle - 90) * (Math.PI / 180))}px`,
                    }}
                  >
                    {mode === "hour" ? selectedHour : selectedMinute.toString().padStart(2, "0")}
                  </div>

                  {/* Render Dial Numbers */}
                  {mode === "hour"
                    ? // Hours 1-12
                      Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => {
                        const isSelected = selectedHour === hr;
                        return (
                          <div
                            key={hr}
                            className={`w-[28px] h-[28px] absolute flex items-center justify-center text-[14px] font-medium transition-colors -translate-x-1/2 -translate-y-1/2 select-none ${
                              isSelected ? "text-primary-foreground opacity-0" : "text-foreground hover:text-primary"
                            }`}
                            style={getDialPosition(hr)}
                          >
                            {hr}
                          </div>
                        );
                      })
                    : // Minutes 00, 05, ..., 55
                      minutesValues.map((minVal, idx) => {
                        const minInt = idx * 5;
                        const isSelected = selectedMinute === minInt;
                        return (
                          <div
                            key={minVal}
                            className={`w-[28px] h-[28px] absolute flex items-center justify-center text-[14px] font-medium transition-colors -translate-x-1/2 -translate-y-1/2 select-none ${
                              isSelected ? "text-primary-foreground opacity-0" : "text-foreground hover:text-primary"
                            }`}
                            style={getDialPosition(idx)}
                          >
                            {minVal}
                          </div>
                        );
                      })}
                </div>
              ) : (
                /* Keyboard Input Spacing Helper */
                <div className="h-[240px] flex items-center justify-center w-full mb-6">
                  <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                    Use the inputs above to type the exact hour and minute, then select AM or PM.
                  </p>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="w-full flex items-center justify-between mt-2">
                {/* Input Mode Toggle Button */}
                <button
                  onClick={() => setKeyboardInput(!keyboardInput)}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {keyboardInput ? <ClockIcon className="h-5 w-5" /> : <Keyboard className="h-5 w-5" />}
                </button>

                {/* Cancel / OK Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-primary text-[14px] font-bold tracking-[0.25px] hover:bg-primary/5 transition-colors uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl text-primary text-[14px] font-bold tracking-[0.25px] hover:bg-primary/5 transition-colors uppercase"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
