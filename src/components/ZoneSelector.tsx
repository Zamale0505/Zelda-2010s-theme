import React from "react";
import { ZoneConfig } from "../types";
import { Trees, Flame, Compass, Droplet, Ghost } from "lucide-react";
import { playSelect } from "../utils/sfx";

interface ZoneSelectorProps {
  zones: ZoneConfig[];
  selectedZoneId: string;
  onSelectZone: (zone: ZoneConfig) => void;
}

export function ZoneSelector({
  zones,
  selectedZoneId,
  onSelectZone,
}: ZoneSelectorProps) {

  const handleZoneClick = (zone: ZoneConfig) => {
    onSelectZone(zone);
    playSelect().catch(() => {});
  };

  const getZoneIcon = (id: string) => {
    switch (id) {
      case "faron_woods":
        return <Trees className="w-5 h-5 text-emerald-400 group-hover:animate-bounce" />;
      case "eldin_volcano":
        return <Flame className="w-5 h-5 text-rose-500 group-hover:scale-110" />;
      case "lanayru_desert":
        return <Compass className="w-5 h-5 text-amber-500 group-hover:rotate-12" />;
      case "lake_hylia":
        return <Droplet className="w-5 h-5 text-sky-400 group-hover:animate-pulse" />;
      case "shadow_citadel":
        return <Ghost className="w-5 h-5 text-violet-400 group-hover:opacity-80" />;
      default:
        return <Compass className="w-5 h-5 text-amber-400" />;
    }
  };

  const getZoneColorText = (id: string, active: boolean) => {
    if (!active) return "text-gray-400";
    switch (id) {
      case "faron_woods":
        return "text-emerald-300 font-bold";
      case "eldin_volcano":
        return "text-rose-400 font-bold";
      case "lanayru_desert":
        return "text-amber-400 font-bold";
      case "lake_hylia":
        return "text-sky-300 font-bold";
      case "shadow_citadel":
        return "text-violet-400 font-bold";
      default:
        return "text-amber-300 font-bold";
    }
  };

  const getZoneBorder = (id: string, active: boolean) => {
    if (!active) return "border-white/5 bg-black/10 hover:border-white/20";
    switch (id) {
      case "faron_woods":
        return "border-emerald-500 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.25)]";
      case "eldin_volcano":
        return "border-rose-600 bg-rose-950/20 shadow-[0_0_10px_rgba(244,63,94,0.25)]";
      case "lanayru_desert":
        return "border-amber-500 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.25)]";
      case "lake_hylia":
        return "border-sky-500 bg-sky-950/20 shadow-[0_0_10px_rgba(14,165,233,0.25)]";
      case "shadow_citadel":
        return "border-violet-600 bg-violet-950/25 shadow-[0_0_10px_rgba(124,58,237,0.25)]";
      default:
        return "border-amber-400 bg-amber-950/10";
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-black/40 border border-[#d4af37]/20 rounded-lg shadow-inner">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-pixel text-[#d4af37] tracking-wider uppercase">
          Dynamic Kingdom Map
        </label>
        <span className="text-[9px] font-mono text-gray-500 uppercase font-black">
          Select Biome Zone
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 pt-1">
        {zones.map((zone) => {
          const isActive = zone.id === selectedZoneId;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => handleZoneClick(zone)}
              className={`group flex flex-col items-center justify-center p-2.5 rounded border transition-all text-center relative gap-1.5 focus:outline-none cursor-pointer ${getZoneBorder(
                zone.id,
                isActive
              )}`}
              title={`Switch current zone to ${zone.name}`}
            >
              <div className="p-1 rounded-full bg-black/40 shadow-sm border border-white/5 flex items-center justify-center">
                {getZoneIcon(zone.id)}
              </div>
              <div>
                <div className={`text-xs leading-tight uppercase font-display tracking-widest ${getZoneColorText(zone.id, isActive)}`}>
                  {zone.name}
                </div>
              </div>

              {/* Little active light dot */}
              {isActive && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Short lore snippet for the selected zone */}
      <div className="mt-1 bg-black/50 p-2 rounded-md border border-white/5">
        <p className="text-[11px] text-gray-300 leading-snug">
          🛡️ <span className="font-bold text-amber-100 font-display uppercase tracking-widest text-[10px]">
            {zones.find((z) => z.id === selectedZoneId)?.name}:
          </span>{" "}
          <span className="italic font-mono text-[10px] opacity-80">
            {zones.find((z) => z.id === selectedZoneId)?.description}
          </span>
        </p>
      </div>
    </div>
  );
}
