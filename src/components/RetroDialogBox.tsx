import React, { useState, useEffect, useRef } from "react";
import { playLetterBlip } from "../utils/sfx";

interface RetroDialogBoxProps {
  text: string;
  speakerName: string;
  speakerRole: string;
  avatarEmoji?: string;
  loading?: boolean;
}

export function RetroDialogBox({
  text,
  speakerName,
  speakerRole,
  avatarEmoji = "💬",
  loading = false,
}: RetroDialogBoxProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const textRef = useRef(text);
  const intervalRef = useRef<number | null>(null);

  // Restart typing animation when text or loading changes
  useEffect(() => {
    if (loading) {
      setDisplayedText("The ancient ruins tremble, looking for answers...");
      setIsTyping(true);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;
    textRef.current = text;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const typeLetter = () => {
      if (indexRef.current < textRef.current.length) {
        const nextChar = textRef.current[indexRef.current];
        setDisplayedText((prev) => prev + nextChar);
        indexRef.current += 1;

        // Play authentic tone (not on spaces, to sound clean)
        if (nextChar !== " " && indexRef.current % 2 === 0) {
          playLetterBlip().catch(() => {});
        }
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Typeout speed
    intervalRef.current = window.setInterval(typeLetter, 22);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, loading]);

  const handleSkipOrReplay = () => {
    if (loading) return;
    if (isTyping) {
      // Force complete
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      // Replay
      setDisplayedText("");
      setIsTyping(true);
      indexRef.current = 0;
      const typeLetter = () => {
        if (indexRef.current < textRef.current.length) {
          setDisplayedText((prev) => prev + textRef.current[indexRef.current]);
          if (textRef.current[indexRef.current] !== " " && indexRef.current % 2 === 0) {
            playLetterBlip().catch(() => {});
          }
          indexRef.current += 1;
        } else {
          setIsTyping(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      };
      intervalRef.current = window.setInterval(typeLetter, 22);
    }
  };

  return (
    <div
      onClick={handleSkipOrReplay}
      className="relative w-full border-4 border-[#3b2b1d] bg-[#1a130e] text-[#f7e6ca] p-5 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.7)] cursor-pointer select-none ring-2 ring-[#d4af37] overflow-hidden"
      id="retro-dialog-box"
    >
      {/* Decorative metal rivets/gems in corners */}
      <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-black shadow-inner animate-pulse" />
      <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-black shadow-inner animate-pulse" />
      <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-black shadow-inner animate-pulse" />
      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full border border-black shadow-inner animate-pulse" />

      {/* Decorative moss/leaves */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-[#2d5a27] border border-[#d4af37] rounded-b text-[8px] font-pixel text-[#fcd34d] tracking-widest uppercase">
        NARRATOR CHANNEL
      </div>

      <div className="flex gap-4 items-start relative z-10 pt-1">
        {/* Avatar badge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 rounded-md bg-[#2d2116] border-2 border-[#d4af37] flex items-center justify-center text-3xl shadow-inner relative group hover:scale-105 transition-transform duration-200">
            {avatarEmoji}
            {loading && (
              <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-t-transparent border-[#d4af37] rounded-full animate-spin" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-pixel text-[#d4af37] max-w-[80px] truncate text-center block">
            {speakerName}
          </span>
        </div>

        {/* Text Area */}
        <div className="flex-1 flex flex-col justify-between min-h-[72px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-pixel text-[#fbd38d] uppercase tracking-wider">
                {speakerName}
              </span>
              <span className="px-1.5 py-0.5 text-[8px] font-mono bg-[#382415] text-[#d4af37] rounded border border-[#6b4c2b] uppercase font-bold">
                {speakerRole}
              </span>
            </div>
            <p className="font-mono text-base font-medium leading-relaxed text-[#f7e6ca] break-words">
              {displayedText}
            </p>
          </div>

          {/* Prompt status and hint cursor */}
          <div className="mt-2 text-right">
            {isTyping ? (
              <span className="text-[9px] font-mono opacity-50 italic">
                Click box to fast-forward...
              </span>
            ) : (
              <div className="inline-flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono opacity-50">
                  Click to repeat chant
                </span>
                {/* Classic triangular flashing cursor */}
                <span className="w-0.5 h-0.5 border-4 border-transparent border-t-[#d4af37] mt-1 animate-ping inline-block" />
                <span className="text-[#d4af37] font-pixel text-xs animate-bounce inline-block">
                  ▼
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
