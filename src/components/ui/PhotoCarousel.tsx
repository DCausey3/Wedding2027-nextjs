"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = { src: string; alt: string };

const IVORY = "#FFF7EC";
const APRICOT = "#FFB482";
const SKY_DEEP = "#123B54";

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export function PhotoCarousel({
  slides,
  interval = 6000,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const paginate = useCallback(
    (d: number) =>
      setPage(([i]) => [(i + d + slides.length) % slides.length, d]),
    [slides.length]
  );

  // Autoplay, pauses on hover/focus/touch
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => paginate(1), interval);
    return () => clearInterval(t);
  }, [paused, paginate, interval, slides.length]);

  const slide = slides[index];

  return (
    <div
      className="relative mx-auto max-w-4xl"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Save the date photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") paginate(-1);
        if (e.key === "ArrowRight") paginate(1);
      }}
    >
      <div
        className="relative aspect-[4/5] sm:aspect-[16/10] overflow-hidden rounded-2xl"
        style={{ backgroundColor: SKY_DEEP }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) paginate(1);
              else if (info.offset.x > 80) paginate(-1);
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {/* Blurred backdrop fills the empty space for any photo shape */}
            <Image
              src={slide.src}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover scale-110 blur-2xl opacity-60"
            />
            {/* The real photo, never cropped */}
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-contain select-none pointer-events-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition hover:opacity-80"
              style={{ backgroundColor: "rgba(18,59,84,0.55)", color: IVORY }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition hover:opacity-80"
              style={{ backgroundColor: "rgba(18,59,84,0.55)", color: IVORY }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setPage([i, i > index ? 1 : -1])}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === index}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? APRICOT : "#E6D2B3",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}