import React from "react";
import { playSelect } from "../utils/sfx";
import { Sword, Compass, Shield, Wind, Sparkles, Eye, Anchor, FlameKindling, Hammer } from "lucide-react";

interface InventoryGridProps {
  selectedItems: string[];
  allItems: Array<{ name: string; type: string }>;
  onToggleItem: (itemName: string) => void;
}

export function InventoryGrid({
  selectedItems,
  allItems,
  onToggleItem,
}: InventoryGridProps) {

  const handleToggle = (name: string) => {
    onToggleItem(name);
    playSelect().catch(() => {});
  };

  // Helper to map item names to authentic Lucide retro icons
  const getItemIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("sword")) return <Sword className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />;
    if (n.includes("ocarina")) return <Wind className="w-5 h-5 text-sky-400 group-hover:text-sky-300" />;
    if (n.includes("shield")) return <Shield className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />;
    if (n.includes("boots")) return <Sparkles className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />;
    if (n.includes("hookshot") || n.includes("grappling")) return <Anchor className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />;
    if (n.includes("bow")) return <FlameKindling className="w-5 h-5 text-red-400 group-hover:text-red-300" />;
    if (n.includes("lens")) return <Eye className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />;
    return <Compass className="w-5 h-5 text-[#d4af37]" />;
  };

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-black/40 border border-[#d4af37]/20 rounded-lg shadow-inner">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-pixel text-[#d4af37] tracking-wider uppercase">
          Hero Equipment Satchel
        </label>
        <span className="text-[10px] font-mono text-amber-500 font-bold">
          {selectedItems.length} Key Artifacts Active
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
        {allItems.map((item) => {
          const isSelected = selectedItems.includes(item.name);
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleToggle(item.name)}
              className={`group flex items-center gap-2 p-2 rounded border transition-all text-left relative overflow-hidden ${
                isSelected
                  ? "bg-[#2d2116] border-[#d4af37] text-[#f7e6ca] shadow-[0_0_8px_rgba(212,175,55,0.3)] animate-pulse"
                  : "bg-black/20 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
              }`}
              title={`Toggle ${item.name} in inventory`}
            >
              {/* Highlight flash effect on active items */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 rotate-45 bg-[#d4af37]/10 pointer-events-none" />
              )}
              
              <div className="flex-shrink-0">
                {getItemIcon(item.name)}
              </div>

              <div className="min-w-0">
                <div className="text-xs font-semibold truncate leading-tight">
                  {item.name}
                </div>
                <div className="text-[9px] font-mono opacity-50 uppercase tracking-widest leading-none">
                  {item.type}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
