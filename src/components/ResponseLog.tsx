import React from "react";
import { LogItem, DialogueLogItem, HintLogItem, QuestLogItem, BossLogItem, ItemLoreLogItem } from "../types";
import { Copy, BookOpen, Skull, Milestone, HelpCircle, ShieldAlert } from "lucide-react";

interface ResponseLogProps {
  logs: LogItem[];
  onClearLogs: () => void;
  onCopyText: (text: string) => void;
}

export function ResponseLog({ logs, onClearLogs, onCopyText }: ResponseLogProps) {

  // Copy helper
  const handleCopy = (item: LogItem) => {
    let textToCopy = "";
    if (item.type === "dialogue") {
      textToCopy = `[${item.npcName.toUpperCase()} - ${item.npcRole.toUpperCase()}]: "${item.text}"`;
    } else if (item.type === "hint") {
      textToCopy = `[Cryptic Stone Hint for ${item.dungeonName}]: "${item.text}"`;
    } else if (item.type === "quest") {
      textToCopy = `[JOURNAL QUEST: ${item.title}] \nSetup: ${item.description} \nReward Hint: ${item.rewardHint}`;
    } else if (item.type === "boss") {
      textToCopy = `[BOSS FIGHT - ${item.bossName} PH. ${item.bossPhase}]: "${item.text}"`;
    } else if (item.type === "item_lore") {
      textToCopy = `[ARTIFACT DOCUMENTATION: ${item.name}] \nLore: ${item.lore} \nMechanic Detail: ${item.effectHint}`;
    }
    onCopyText(textToCopy);
  };

  const getAvatarEmoji = (npcName: string) => {
    const n = npcName.toLowerCase();
    if (n.includes("kaepora")) return "🦉";
    if (n.includes("torr")) return "⚒️";
    if (n.includes("kiki")) return "🧒";
    if (n.includes("malon")) return "👩‍🌾";
    if (n.includes("impa")) return "🧝‍♀️";
    if (n.includes("malakor")) return "🔮";
    return "💬";
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1610]/95 border-2 border-[#8c6239] rounded-lg shadow-2xl p-4 overflow-hidden relative">
      {/* Scroll borders decorative */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
        <button
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="px-2.5 py-1 text-[9px] font-pixel bg-red-950/80 hover:bg-red-950 text-red-200 border border-red-800 disabled:opacity-40 disabled:cursor-not-allowed rounded uppercase tracking-wider transition-colors"
        >
          BURN LOGS
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 border-b border-[#8c6239]/30 pb-2">
        <BookOpen className="w-5 h-5 text-[#d4af37]" />
        <h3 className="font-display font-bold text-[#d4af37] text-lg tracking-wide">
          Kingdom Chronicles
        </h3>
        <span className="text-xs text-amber-500/80 font-mono">
          ({logs.length} records saved)
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#8c6239]/20 rounded bg-black/10">
          <BookOpen className="w-12 h-12 text-[#8c6239]/40 mb-3 animate-pulse" />
          <p className="font-display italic text-[#8c6239] text-sm">
            The scrolls are dry and dusty...
          </p>
          <p className="text-[10px] font-mono text-gray-500 max-w-xs mt-1">
            Choose a mode, set the game state variables, and chant standard queries to generate in-world lore.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {logs.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Copy button top-right hover */}
                <button
                  onClick={() => handleCopy(item)}
                  className="absolute right-2 top-2 p-1.5 rounded bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black text-[#d4af37] border border-[#d4af37]/30 z-10"
                  title="Copy to Clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* --- 1. NPC DIALOGUE LOG VIEW --- */}
                {item.type === "dialogue" && (
                  <div className="border border-amber-950 bg-[#2b1e15] rounded p-3.5 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#1b6521]" />
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded border border-[#d4af37]/45 bg-[#3c291b] flex items-center justify-center text-xl shadow-md">
                        {getAvatarEmoji(item.npcName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] text-[#fcd34d]/80 font-mono mb-1">
                          <span className="uppercase font-bold tracking-wider">
                            💬 DIALOGUE: {item.npcName}
                          </span>
                          <span className="opacity-60">{item.timestamp}</span>
                        </div>
                        <p className="text-sm font-mono text-[#fcd34d] bg-black/35 p-2 rounded border border-[#8c6239]/20 italic leading-relaxed">
                          "{item.text}"
                        </p>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1.5 text-[8px] font-mono opacity-60">
                          <span>📍 Location: <strong>{item.zone}</strong></span>
                          <span>❤️ HP: <strong>{item.hearts}</strong></span>
                          <span>🎒 Gear: <strong className="max-w-[120px] truncate inline-block align-top">{item.items.join(", ") || "None"}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 2. DUNGEON HINT STONE TABLET --- */}
                {item.type === "hint" && (
                  <div className="border-2 border-slate-700 bg-slate-900 rounded p-4 text-slate-300 relative overflow-hidden shadow-2xl scanline-effect">
                    <div className="absolute top-0 right-0 p-1 font-pixel text-[6px] text-slate-500 uppercase">
                      Ancient Inscription
                    </div>
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-pixel uppercase tracking-wide mb-1">
                          🪨 THE RUINS OF {item.dungeonName.toUpperCase()}
                        </div>
                        <p className="text-xs font-mono font-bold text-sky-100 bg-slate-950/80 p-2.5 rounded border border-slate-700/50 italic tracking-wider leading-relaxed">
                          {item.text}
                        </p>
                        <div className="mt-1 text-[8px] font-pixel text-slate-500 uppercase tracking-widest text-right">
                          - {item.zone} Runic Carving
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 3. PARCHMENT ROYAL QUEST SCROLL --- */}
                {item.type === "quest" && (
                  <div className="border border-[#c6a052] bg-[#fdfaf2] text-[#3e2723] rounded p-4 shadow-[3px_3px_12px_rgba(0,0,0,0.15)] relative overflow-hidden">
                    {/* Retro seal top-right */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 border border-red-800 flex items-center justify-center text-[10px] text-white font-extrabold rotate-12 shadow-sm uppercase">
                      SEAL
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Milestone className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                      <div className="mr-6">
                        <div className="text-[9px] font-pixel text-amber-800 uppercase tracking-wider mb-0.5">
                          📜 Parchment Quest Roll - {item.questGiver}
                        </div>
                        <h4 className="font-display font-extrabold text-lg text-amber-950 leading-tight border-b border-amber-800/20 pb-1 mb-2">
                          {item.title}
                        </h4>
                        <p className="text-xs leading-relaxed font-sans mt-1 italic text-[#5d4037] pb-2 border-b border-dashed border-amber-700/15">
                          {item.description}
                        </p>
                        <div className="mt-2 bg-amber-100/50 p-2 rounded border border-amber-200 text-xs">
                          <span className="font-bold text-amber-900 block text-[9px] font-pixel tracking-wide uppercase">
                            🎁 Reward Hint:
                          </span>
                          <span className="font-mono text-[#5d4037]">
                            {item.rewardHint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 4. Crimson Boss Taunt Sheet --- */}
                {item.type === "boss" && (
                  <div className="border-2 border-red-900 bg-red-950/90 text-red-200 rounded p-4 shadow-[0_4px_12px_rgba(220,38,38,0.15)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
                    <div className="flex items-start gap-2.5 relative z-10">
                      <Skull className="w-5 h-5 text-red-500 mt-1 flex-shrink-0 animate-bounce" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-[10px] text-red-400 font-pixel mb-1.5 uppercase">
                          <span>💀 Confrontation: {item.bossName}</span>
                          <span className="px-1.5 py-0.5 bg-red-900 text-red-100 rounded text-[8px] font-pixel">
                            PHASE {item.bossPhase}
                          </span>
                        </div>
                        <p className="text-sm font-mono font-bold text-red-100 p-2 rounded bg-black/40 border border-red-800/40 italic leading-relaxed tracking-wider">
                          "{item.text}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 5. Item Lore Golden Codex Card --- */}
                {item.type === "item_lore" && (
                  <div className="border-2 border-[#d4af37] bg-gradient-to-br from-[#1c140d] to-[#2e2316] text-[#f7e6ca] rounded p-4 shadow-[0_0_15px_rgba(212,175,55,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-[#d4af37] text-black font-pixel text-[8px] flex items-center justify-center font-bold tracking-widest uppercase rounded-bl shadow-md">
                      LORE
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-[#d4af37] mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#d4af37] font-pixel tracking-wider uppercase mb-0.5">
                          ✨ MYTHOLOGICAL ARTIFACT
                        </div>
                        <h4 className="font-display font-extrabold text-xl text-amber-100 tracking-wide border-b border-[#d4af37]/30 pb-1 mb-2">
                          {item.name}
                        </h4>
                        <p className="text-xs leading-relaxed font-sans italic text-[#f7e6ca]/80 mb-2.5">
                          {item.lore}
                        </p>
                        <div className="bg-[#120a05] p-2 rounded border border-[#d4af37]/15">
                          <span className="text-[8px] font-pixel text-amber-400 block uppercase mb-1">
                            ⚠️ Divine Magic / Effect Details:
                          </span>
                          <p className="text-xs font-mono text-[#fcd34d] leading-normal">
                            {item.effectHint}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
