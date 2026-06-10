import React from "react";
import { playHeartChange } from "../utils/sfx";

interface HeartContainerProps {
  currentHearts: number;
  maxHearts?: number;
  onChange: (newHearts: number) => void;
}

export function HeartContainer({
  currentHearts,
  maxHearts = 12,
  onChange,
}: HeartContainerProps) {

  const handleHeartClick = (index: number) => {
    const targetHearts = index + 1;
    let gained = targetHearts > currentHearts;
    
    // Toggle last heart off to facilitate easy down-scaling
    let nextHearts = targetHearts;
    if (targetHearts === currentHearts) {
      nextHearts = currentHearts - 1;
      gained = false;
    }
    
    // Bounds check
    if (nextHearts < 0) nextHearts = 0;
    if (nextHearts > maxHearts) nextHearts = maxHearts;

    onChange(nextHearts);
    playHeartChange(gained).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-1.5 p-3.5 bg-black/40 border border-[#d4af37]/20 rounded-lg shadow-inner">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-pixel text-[#d4af37] tracking-wider uppercase">
          HeroVitality (HP)
        </label>
        <span className="text-[11px] font-mono font-bold text-red-400">
          {currentHearts}/{maxHearts} Hearts
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {Array.from({ length: maxHearts }).map((_, i) => {
          const isFull = i < currentHearts;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleHeartClick(i)}
              className="group relative cursor-pointer focus:outline-none transition-transform active:scale-95 hover:scale-110 duration-100"
              title={`Set HP energy level to ${i + 1}`}
            >
              {isFull ? (
                // Crimson Pixel Heart Glistening
                <svg
                  className="w-6 h-6 text-red-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.5)] transition-colors duration-100"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM7.5 5C5.57 5 4 6.57 4 8.5c0 2.87 2.89 5.56 8 10.21 5.11-4.65 8-7.34 8-10.21 0-1.93-1.57-3.5-3.5-3.5-1.4 0-2.73.91-3.19 2.21h-2.61C10.23 5.91 8.9 5 7.5 5z" />
                  {/* Innermost pixel glow */}
                  <path d="M12 20.1C16.8 15.7 20 12.8 20 9.5c0-1.4-1.1-2.5-2.5-2.5-1.2 0-2.3.8-2.7 1.9H13v-1h-2v1H9.2C8.8 7.8 7.7 7 6.5 7 5.1 7 4 8.1 4 9.5c0 3.3 3.2 6.2 8 10.6l0-.0z" />
                  {/* Decorative pixel highlight */}
                  <rect x="6" y="6" width="3" height="3" fill="#ffffff" opacity="0.8" className="rounded" />
                </svg>
              ) : (
                // Dark Empty Heart Container
                <svg
                  className="w-6 h-6 text-gray-700 transition-colors duration-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                  {/* Subtle pixel indicator inside empty heart */}
                  <circle cx="12" cy="12" r="2" className="fill-gray-800 opacity-60" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] font-mono opacity-60">
        <span>Click container to take damage</span>
        <span>Click to recover energy</span>
      </div>
    </div>
  );
}
