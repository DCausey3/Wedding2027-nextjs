"use client";

import { useState, useEffect } from "react";
import { getTimeLeft } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  textColor?: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({
  targetDate,
  label,
  textColor = "#1a1209",
  accentColor = "#d4a574",
  size = "md",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const numSize = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-xl";
  const labelSize = size === "lg" ? "text-[0.55rem]" : "text-[0.5rem]";

  if (!mounted) {
    return <div className="h-16" aria-hidden />;
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="label-overline" style={{ color: accentColor }}>
          {label}
        </p>
      )}
      <div className="flex items-center gap-4">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`font-serif font-light leading-none ${numSize}`}
                style={{ color: textColor }}
              >
                {String(u.value).padStart(2, "0")}
              </span>
              <span
                className={`uppercase tracking-widest mt-1 ${labelSize}`}
                style={{ color: accentColor }}
              >
                {u.label}
              </span>
            </div>
            {i < units.length - 1 && (
              <span
                className="font-serif text-xl font-light mb-3"
                style={{ color: accentColor, opacity: 0.5 }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
