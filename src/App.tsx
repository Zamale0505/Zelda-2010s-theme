import React, { useState, useEffect } from "react";
import { LogItem, NPCConfig, ZoneConfig } from "./types";
import {
  PRECONFIG_NPCS,
  PRECONFIG_ZONES,
  PRECONFIG_ITEMS,
  PRECONFIG_DUNGEONS,
  INITIAL_LOG_ITEMS,
} from "./data";
import {
  playSelect,
  playJingleSuccess,
  playQuestDiscovery,
} from "./utils/sfx";
import { RetroDialogBox } from "./components/RetroDialogBox";
import { HeartContainer } from "./components/HeartContainer";
import { InventoryGrid } from "./components/InventoryGrid";
import { ZoneSelector } from "./components/ZoneSelector";
import { ResponseLog } from "./components/ResponseLog";

import {
  ShieldAlert,
  Sparkles,
  HelpCircle,
  BookOpen,
  Milestone,
  Volume2,
  VolumeX,
  User,
  MapPin,
  ChevronRight,
  RefreshCw,
  Skull,
  Info,
} from "lucide-react";

export default function App() {
  // --- STATE DECLARATIONS ---
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem("rpg_player_name") || "Link";
  });
  const [playerHearts, setPlayerHearts] = useState<number>(() => {
    const saved = localStorage.getItem("rpg_player_hearts");
    return saved ? parseInt(saved, 10) : 6;
  });
  const [playerItems, setPlayerItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("rpg_player_items");
    return saved ? JSON.parse(saved) : ["Master Sword", "Ocarina of Winds"];
  });
  const [selectedZone, setSelectedZone] = useState<ZoneConfig>(() => {
    const saved = localStorage.getItem("rpg_selected_zone_id");
    const found = PRECONFIG_ZONES.find((z) => z.id === saved);
    return found || PRECONFIG_ZONES[0];
  });
  const [selectedNPC, setSelectedNPC] = useState<NPCConfig>(() => {
    const saved = localStorage.getItem("rpg_selected_npc_name");
    const found = PRECONFIG_NPCS.find((n) => n.name === saved);
    return found || PRECONFIG_NPCS[0];
  });

  // Active Quest inputs
  const [questTitleInput, setQuestTitleInput] = useState("The Awakening of the Sacred Stone");
  const [questObjectiveInput, setQuestObjectiveInput] = useState("Retrieve the emerald artifact from the Stone Eye Canopy.");

  // Boss inputs
  const [bossNameInput, setBossNameInput] = useState("Demon King Ganondorf");
  const [bossPhaseInput, setBossPhaseInput] = useState<number>(3); // Desperate final phase by default

  // Dungeon input (derived automatically or custom)
  const [customDungeonName, setCustomDungeonName] = useState("");
  // Item Lore input
  const [customItemName, setCustomItemName] = useState("Master Sword");
  const [customItemType, setCustomItemType] = useState("weapon");

  // Situational Context Override
  const [situationalContext, setSituationalContext] = useState("");

  // Sound enable
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core logging or results state
  const [logs, setLogs] = useState<LogItem[]>(() => {
    const saved = localStorage.getItem("rpg_chronicle_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOG_ITEMS;
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Active Dialogue shown in main Retro Dialog Box
  const [activeDialogue, setActiveDialogue] = useState(() => {
    return "Ah, Link... At last, the ancient green tunic fits your shoulders. Hearken closely to the wind, for the forest whispers of a great shadow ascending the northern peaks.";
  });
  const [activeSpeakerName, setActiveSpeakerName] = useState("Elder Kaepora");
  const [activeSpeakerRole, setActiveSpeakerRole] = useState("village elder");
  const [activeSpeakerEmoji, setActiveSpeakerEmoji] = useState("🦉");

  // --- LOCAL PERSISTENCE SYNCING ---
  useEffect(() => {
    localStorage.setItem("rpg_player_name", playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem("rpg_player_hearts", playerHearts.toString());
  }, [playerHearts]);

  useEffect(() => {
    localStorage.setItem("rpg_player_items", JSON.stringify(playerItems));
  }, [playerItems]);

  useEffect(() => {
    localStorage.setItem("rpg_selected_zone_id", selectedZone.id);
  }, [selectedZone]);

  useEffect(() => {
    localStorage.setItem("rpg_selected_npc_name", selectedNPC.name);
  }, [selectedNPC]);

  useEffect(() => {
    localStorage.setItem("rpg_chronicle_logs", JSON.stringify(logs));
  }, [logs]);

  // Derived dungeons for selected zone
  const zoneDungeons = PRECONFIG_DUNGEONS.filter((d) => d.zoneId === selectedZone.id);
  const activeDungeonName = customDungeonName || (zoneDungeons[0]?.name || "The Forgotten Temple");

  // --- HELPERS & COMPACT API CALLS ---
  const handleToggleItem = (itemName: string) => {
    setPlayerItems((prev) =>
      prev.includes(itemName) ? prev.filter((i) => i !== itemName) : [...prev, itemName]
    );
  };

  const handleSelectZone = (zone: ZoneConfig) => {
    setSelectedZone(zone);
    setCustomDungeonName(""); // reset custom dungeon when zone changes
  };

  const handleNPCSelect = (npc: NPCConfig) => {
    setSelectedNPC(npc);
    if (soundEnabled) playSelect().catch(() => {});
  };

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2500);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("Chronicle entry copied to parchment!");
  };

  // --- NARRATOR GENERATORS ---

  // 1. NPC DIALOGUE CHANT
  const chantNPCDialogue = async () => {
    setLoading(true);
    setErrorText(null);
    if (soundEnabled) playSelect().catch(() => {});

    try {
      const response = await fetch("/api/generate/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: playerName,
          player_hearts: playerHearts,
          player_items: playerItems,
          current_zone: selectedZone.name,
          active_quest: questTitleInput,
          npc_name: selectedNPC.name,
          npc_role: selectedNPC.role,
          situational_context: situationalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server failed to invoke character dialogue.");
      }

      const data = await response.json();
      const generatedText = data.text;

      // Update active viewer
      setActiveDialogue(generatedText);
      setActiveSpeakerName(selectedNPC.name);
      setActiveSpeakerRole(selectedNPC.role);
      setActiveSpeakerEmoji(selectedNPC.avatarEmoji);

      // Create new log item
      const newLog: LogItem = {
        id: `dialogue_${Date.now()}`,
        type: "dialogue",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        npcName: selectedNPC.name,
        npcRole: selectedNPC.role,
        zone: selectedZone.name,
        hearts: playerHearts,
        quest: questTitleInput,
        items: [...playerItems],
        text: generatedText,
      };

      setLogs((prev) => [newLog, ...prev]);
      if (soundEnabled) playJingleSuccess().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. DUNGEON HINT STONE CARVING
  const carveDungeonHint = async () => {
    setLoading(true);
    setErrorText(null);
    if (soundEnabled) playSelect().catch(() => {});

    try {
      const response = await fetch("/api/generate/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dungeon_name: activeDungeonName,
          current_zone: selectedZone.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate dungeon hint carvings.");
      }

      const data = await response.json();
      const generatedText = data.text;

      // Update active viewer as an ancient monolithic sign
      setActiveDialogue(generatedText);
      setActiveSpeakerName("Stone Monument");
      setActiveSpeakerRole("ancient carving");
      setActiveSpeakerEmoji("🪨");

      const newLog: LogItem = {
        id: `hint_${Date.now()}`,
        type: "hint",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dungeonName: activeDungeonName,
        zone: selectedZone.name,
        text: generatedText,
      };

      setLogs((prev) => [newLog, ...prev]);
      if (soundEnabled) playJingleSuccess().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. ROYAL QUEST PARCHMENT SEALING
  const sealQuestParchment = async () => {
    setLoading(true);
    setErrorText(null);
    if (soundEnabled) playSelect().catch(() => {});

    try {
      const response = await fetch("/api/generate/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quest_name: questTitleInput,
          quest_giver: selectedNPC.name,
          objective: questObjectiveInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to catalog quest decree.");
      }

      const data = await response.json(); // { title, description, reward_hint }

      // Update active dialog viewer
      setActiveDialogue(`A royal scroll has been sealed: "${data.title}" - ${data.description}. Reward clued: ${data.reward_hint}`);
      setActiveSpeakerName("Royal Cartographer");
      setActiveSpeakerRole("herald registry");
      setActiveSpeakerEmoji("📜");

      const newLog: LogItem = {
        id: `quest_${Date.now()}`,
        type: "quest",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        questName: questTitleInput,
        questGiver: selectedNPC.name,
        objective: questObjectiveInput,
        title: data.title || questTitleInput,
        description: data.description || "The ancient parchment is heavily smudged.",
        rewardHint: data.reward_hint || "Something of incredible quality.",
      };

      setLogs((prev) => [newLog, ...prev]);
      if (soundEnabled) playQuestDiscovery().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. EVOKE BOSS TAUNT
  const summonBossTaunt = async () => {
    setLoading(true);
    setErrorText(null);
    if (soundEnabled) playSelect().catch(() => {});

    try {
      const response = await fetch("/api/generate/boss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boss_name: bossNameInput,
          boss_phase: bossPhaseInput,
          player_name: playerName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to summon boss taunts.");
      }

      const data = await response.json();
      const generatedText = data.text;

      // Update active viewer to play standard scary boss theme
      setActiveDialogue(generatedText);
      setActiveSpeakerName(bossNameInput);
      setActiveSpeakerRole(`boss battle ph.${bossPhaseInput}`);
      setActiveSpeakerEmoji("💀");

      const newLog: LogItem = {
        id: `boss_${Date.now()}`,
        type: "boss",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bossName: bossNameInput,
        bossPhase: bossPhaseInput,
        text: generatedText,
      };

      setLogs((prev) => [newLog, ...prev]);
      if (soundEnabled) playQuestDiscovery().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. ITEM LORE CODEX
  const documentItemLore = async () => {
    setLoading(true);
    setErrorText(null);
    if (soundEnabled) playSelect().catch(() => {});

    try {
      const response = await fetch("/api/generate/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: customItemName,
          item_type: customItemType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to retrieve legendary relic details.");
      }

      const data = await response.json(); // { name, lore, effect_hint }

      // Update active viewer
      setActiveDialogue(`An ancient relic has been authenticated: "${data.name}" - ${data.lore} [Divine Effect: ${data.effect_hint}]`);
      setActiveSpeakerName("Sacred Archives");
      setActiveSpeakerRole("legendary lore");
      setActiveSpeakerEmoji("✨");

      const newLog: LogItem = {
        id: `item_lore_${Date.now()}`,
        type: "item_lore",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemName: customItemName,
        itemType: customItemType,
        name: data.name || customItemName,
        lore: data.lore || "No readable runes remaining on this artifact.",
        effectHint: data.effect_hint || "Its power stays deep inside.",
      };

      setLogs((prev) => [newLog, ...prev]);
      if (soundEnabled) playQuestDiscovery().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to burn all Chronicle scrolls? This is irreversible!")) {
      setLogs([]);
      setActiveDialogue("The archives have been cleansed with sacred fire. A fresh blank page awaits...");
      setActiveSpeakerName("Royal Archivist");
      setActiveSpeakerRole("system reset");
      setActiveSpeakerEmoji("🔥");
      if (soundEnabled) playSelect().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0905] text-[#f7e6ca] flex flex-col font-sans antialiased overflow-x-hidden selection:bg-[#d4af37]/30">
      {/* Decorative Golden Top Rail */}
      <div className="h-1 bg-[linear-gradient(90deg,#8c6239,#d4af37,#8c6239)] w-full" />

      {/* Header Banner */}
      <header className="py-5 px-4 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#8c6239]/20 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-spin-slow">
              🛡️
            </div>
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-wider text-[#d4af37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              ECHOES OF THE FORGOTTEN KINGDOM
            </h1>
            <p className="text-[10px] font-pixel tracking-widest text-[#fcd34d] opacity-90 uppercase">
              Retro AI Narrator & Character Engine
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex gap-3 items-center">
          {/* Sound toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono font-bold transition-all uppercase ${
              soundEnabled
                ? "bg-[#2b1e15] border-[#d4af37] text-[#d4af37]"
                : "bg-black/30 border-white/10 text-gray-400"
            }`}
            title={soundEnabled ? "Mute retro chiptunes" : "Unmute retro chiptunes"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Audio: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Audio: MUTED</span>
              </>
            )}
          </button>
          
          <div className="hidden sm:block text-right font-mono text-[10px] text-gray-500 bg-black/40 px-3 py-1.5 rounded border border-[#8c6239]/10">
            <span>Realm Time: </span>
            <span className="text-[#d5b038] font-bold">12:00 PM (SOLAR)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Toast copied confirmation */}
        {copiedNotification && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/95 text-[#fcd34d] border-2 border-[#d4af37] py-2.5 px-5 rounded-md shadow-2xl flex items-center gap-2 font-mono text-xs animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Column Left: Engine Cockpit (Zelda state managers) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section: Hero Attributes */}
          <div className="bg-[#1e1610]/95 border-2 border-[#8c6239]/60 rounded-xl p-4 shadow-xl">
            <h2 className="font-display font-black text-sm text-[#d4af37] tracking-widest uppercase mb-3 flex items-center gap-2 border-b border-[#8c6239]/20 pb-1.5">
              <User className="w-4 h-4 text-amber-500" />
              Hero Game Context Variables
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Name Input */}
              <div className="flex flex-col gap-1 bg-black/30 p-3 rounded-lg border border-white/5">
                <label className="text-[10px] font-pixel text-[#d4af37] tracking-wider uppercase">
                  Hero Chosen Name
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="font-mono text-sm bg-black/60 text-white rounded border border-[#8c6239]/40 p-2 focus:outline-none focus:border-[#d4af37] w-full"
                  placeholder="Enter Link or custom hero..."
                />
                <span className="text-[8px] font-mono text-gray-500">
                  Controls how NPCs address the main protagonist.
                </span>
              </div>

              {/* Heart HP vital meter */}
              <HeartContainer currentHearts={playerHearts} onChange={setPlayerHearts} />
            </div>

            {/* Satchel: Equipment checkboxes */}
            <div className="mt-4">
              <InventoryGrid
                selectedItems={playerItems}
                allItems={PRECONFIG_ITEMS}
                onToggleItem={handleToggleItem}
              />
            </div>

            {/* Kingdom Maps Selector */}
            <div className="mt-4">
              <ZoneSelector
                zones={PRECONFIG_ZONES}
                selectedZoneId={selectedZone.id}
                onSelectZone={handleSelectZone}
              />
            </div>
          </div>

          {/* Section: NPC Selection Desk */}
          <div className="bg-[#1e1610]/95 border-2 border-[#8c6239]/60 rounded-xl p-4 shadow-xl">
            <h2 className="font-display font-black text-sm text-[#d4af37] tracking-widest uppercase mb-3 flex items-center gap-2 border-b border-[#8c6239]/20 pb-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Preloaded NPC Personas
            </h2>
            
            <p className="text-[11px] font-mono text-gray-400 mb-2.5">
              Choose the target NPC to invoke dialogue or request quest descriptions:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PRECONFIG_NPCS.map((npc) => {
                const isSelected = npc.name === selectedNPC.name;
                return (
                  <button
                    key={npc.name}
                    type="button"
                    onClick={() => handleNPCSelect(npc)}
                    className={`p-2.5 rounded border transition-all text-left flex gap-2 items-center cursor-pointer ${
                      isSelected
                        ? "bg-[#2d2116] border-[#d4af37] text-white"
                        : "bg-black/20 border-white/5 text-gray-400 hover:border-white/10 hover:text-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{npc.avatarEmoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{npc.name}</div>
                      <div className="text-[9px] font-mono uppercase tracking-wide opacity-50">
                        {npc.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected NPC mini stats detail */}
            <div className="mt-3 bg-black/40 p-2.5 rounded border border-amber-950/40 text-xs">
              <span className="text-[#d4af37] font-semibold">Voice Persona:</span>{" "}
              <span className="italic font-mono text-gray-300">"{selectedNPC.description}"</span>
            </div>
          </div>

          {/* Grid for Active Quest & Boss Customizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Quest Configuration Pane */}
            <div className="bg-[#1e1610]/95 border-2 border-[#8c6239]/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-[#d4af37] text-sm tracking-widest uppercase border-b border-[#8c6239]/20 pb-1.5 mb-3 flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-amber-400" />
                  Quest Objectives Board
                </h3>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-pixel text-amber-500/80 uppercase">
                      Decree/Quest Name
                    </label>
                    <input
                      type="text"
                      className="text-xs font-mono bg-black/60 p-2 rounded border border-[#8c6239]/40 text-gray-100 focus:outline-none"
                      value={questTitleInput}
                      onChange={(e) => setQuestTitleInput(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-pixel text-amber-500/80 uppercase">
                      Protagonist Objective
                    </label>
                    <textarea
                      rows={2}
                      className="text-xs font-mono bg-black/60 p-2 rounded border border-[#8c6239]/40 text-gray-100 focus:outline-none resize-none"
                      value={questObjectiveInput}
                      onChange={(e) => setQuestObjectiveInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#8c6239]/10 mt-3 text-[10px] font-mono text-gray-500">
                Determines situational speech guidelines and parchment scrolls generation target.
              </div>
            </div>

            {/* Boss Customizer Pane */}
            <div className="bg-[#1e1610]/95 border-2 border-[#8c6239]/60 rounded-xl p-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-[#d4af37] text-sm tracking-widest uppercase border-b border-[#8c6239]/20 pb-1.5 mb-3 flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-500" />
                  Sinister Boss Arena
                </h3>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-pixel text-red-400 uppercase">
                      Diabolical Target Name
                    </label>
                    <input
                      type="text"
                      className="text-xs font-mono bg-black/60 p-2 rounded border border-[#8c6239]/40 text-gray-100 focus:outline-none"
                      value={bossNameInput}
                      onChange={(e) => setBossNameInput(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-pixel text-red-400 uppercase">
                      Current Combat Phase: Ph. {bossPhaseInput}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((ph) => (
                        <button
                          key={ph}
                          type="button"
                          onClick={() => {
                            setBossPhaseInput(ph);
                            if (soundEnabled) playSelect().catch(() => {});
                          }}
                          className={`flex-1 py-1.5 text-xs font-pixel rounded border transition-all ${
                            bossPhaseInput === ph
                              ? "bg-red-950 border-red-500 text-red-100 font-extrabold shadow-md shadow-red-900/30"
                              : "bg-black/30 border-[#8c6239]/30 text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          Ph. {ph}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#8c6239]/10 mt-3 text-[10px] font-mono text-gray-500">
                Phase controls boss taunt tone (arrogant to absolute desperate meltdown rage!).
              </div>
            </div>

          </div>

          {/* Section: Custom Direct Prompts */}
          <div className="bg-[#1e1610]/95 border-2 border-[#8c6239]/60 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#8c6239]/20 pb-1.5 mb-2">
              <h2 className="font-display font-black text-sm text-[#d4af37] tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Narrator Situational Enhancements
              </h2>
              <span className="px-1.5 py-0.5 text-[8px] font-pixel bg-amber-950 text-amber-400 border border-amber-900 rounded select-none">
                OPTIONAL FLAVOR
              </span>
            </div>

            <textarea
              rows={2}
              maxLength={150}
              placeholder="e.g. Torr is holding a cold tankard of cider; Elder Kaepora speaks with a heavy cold; NPC has lost their reading glasses; or NPC is highly suspicious of the player."
              value={situationalContext}
              onChange={(e) => setSituationalContext(e.target.value)}
              className="w-full text-xs font-mono bg-black/60 p-2.5 rounded border border-[#8c6239]/40 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none"
            />
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 mt-1">
              <span>Adds special environmental variables to the AI roleplay instructions.</span>
              <span>{situationalContext.length}/150 char max</span>
            </div>
          </div>

        </div>

        {/* Column Right: Retro Dialog & Active Journal */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section: Retro Screen Dialog Box */}
          <div className="bg-black border-4 border-[#3a2010] p-4 rounded-xl shadow-2xl relative scanline-effect flex flex-col gap-4">
            
            <div className="flex justify-between items-center bg-[#21160d] -mx-4 -mt-4 px-4 py-2 border-b-2 border-[#3a2010] text-[9px] font-pixel text-amber-500 tracking-widest uppercase">
              <span>CRT ACTIVE STREAM</span>
              <span className="animate-blink">● LIVE FEED</span>
            </div>

            {/* Error alerts pane */}
            {errorText && (
              <div className="bg-red-950/90 border border-red-500/80 p-3 rounded-lg flex items-start gap-2.5 relative z-20 shadow-md">
                <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 animate-bounce mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-400 font-pixel text-[10px] uppercase">Runic Generation Interrupted</h4>
                  <p className="text-[11px] font-mono text-red-200 mt-0.5 break-words">
                    {errorText}
                  </p>
                  <p className="text-[9px] text-red-300/60 font-mono mt-1">
                    Please make sure your API key is correctly configured inside AI Studio secrets.
                  </p>
                </div>
              </div>
            )}

            {/* The primary Retro Dialogue */}
            <RetroDialogBox
              text={activeDialogue}
              speakerName={activeSpeakerName}
              speakerRole={activeSpeakerRole}
              avatarEmoji={activeSpeakerEmoji}
              loading={loading}
            />

            {/* RPG ACTION CONTROLS - Sparking the 5 Modes */}
            <div className="space-y-2 mt-2 relative z-10">
              <div className="text-[9px] font-pixel text-gray-500 uppercase tracking-widest text-center border-b border-white/5 pb-1 select-none">
                🧙‍♂️ CHOOSE YOUR SPELL (ACTOR TRIGGER)
              </div>

              {/* Mode 1 & 2 */}
              <div className="grid grid-cols-2 gap-2">
                {/* 1. NPC Dialogue */}
                <button
                  type="button"
                  onClick={chantNPCDialogue}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-pixel bg-gradient-to-b from-emerald-800 to-emerald-900 border border-emerald-500 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-40 text-emerald-100 rounded cursor-pointer shadow-md active:scale-98 transition-all hover:shadow-[0_0_8px_rgba(52,211,153,0.3)] font-bold tracking-tight uppercase"
                  title="Generate dynamic dialogue from the selected NPC"
                >
                  <span>💬 Talk Dialogue</span>
                </button>

                {/* 2. Dungeon Hint */}
                <button
                  type="button"
                  onClick={carveDungeonHint}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-pixel bg-gradient-to-b from-sky-800 to-sky-900 border border-sky-500 hover:from-sky-700 hover:to-sky-800 disabled:opacity-40 text-sky-100 rounded cursor-pointer shadow-md active:scale-98 transition-all hover:shadow-[0_0_8px_rgba(56,189,248,0.3)] font-bold tracking-tight uppercase"
                  title="Generate a cryptic carved-in-stone hint"
                >
                  <span>🪨 Dungeon Hint</span>
                </button>
              </div>

              {/* Mode 3 & 4 */}
              <div className="grid grid-cols-2 gap-2">
                {/* 3. Quest Scroll */}
                <button
                  type="button"
                  onClick={sealQuestParchment}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-pixel bg-gradient-to-b from-amber-700 to-amber-800 border border-amber-500 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-amber-100 rounded cursor-pointer shadow-md active:scale-98 transition-all hover:shadow-[0_0_8px_rgba(245,158,11,0.3)] font-bold tracking-tight uppercase"
                  title="Generate a fully styled parchment scroll block"
                >
                  <span>📜 Quest Scroll</span>
                </button>

                {/* 4. Boss Taunt */}
                <button
                  type="button"
                  onClick={summonBossTaunt}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-pixel bg-gradient-to-b from-red-800 to-red-900 border border-red-600 hover:from-red-700 hover:to-red-800 disabled:opacity-40 text-red-100 rounded cursor-pointer shadow-md active:scale-98 transition-all hover:shadow-[0_0_8px_rgba(239,68,68,0.3)] font-bold tracking-tight uppercase"
                  title="Unleash a dramatic monologue confrontation taunt"
                >
                  <span>💀 Boss Taunt</span>
                </button>
              </div>

              {/* Mode 5: Custom Item Lore catalog */}
              <div className="flex flex-col gap-1.5 border border-white/5 p-2 rounded bg-black/40">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      className="flex-1 text-[11px] font-mono bg-black border border-[#8c6239]/30 rounded px-1.5 py-1 text-gray-200 focus:outline-none"
                      placeholder="Item name (e.g. Grappling hook)"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                    />
                    <select
                      className="text-[10px] font-mono bg-stone-900 border border-[#8c6239]/30 rounded text-gray-300 px-1 focus:outline-none"
                      value={customItemType}
                      onChange={(e) => setCustomItemType(e.target.value)}
                    >
                      <option value="weapon">Weapon</option>
                      <option value="armor">Armor</option>
                      <option value="relic">Relic</option>
                      <option value="accessory">Accessory</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={documentItemLore}
                    disabled={loading || !customItemName.trim()}
                    className="py-1 px-3 text-[10px] font-pixel bg-gradient-to-b from-purple-800 to-purple-900 border border-purple-500 hover:from-purple-700 hover:to-purple-800 text-purple-100 rounded cursor-pointer disabled:opacity-40 transition-all font-bold uppercase whitespace-nowrap"
                    title="Retrieve in-world mythical history"
                  >
                    ✨ Lore Card
                  </button>
                </div>
              </div>

            </div>

            {/* Quick interactive dungeon hint helper */}
            <div className="bg-[#1e1610]/40 p-2.5 rounded-lg border border-[#8c6239]/15 flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-mono">Dungeon Target:</span>
              <span className="font-bold text-amber-300 font-mono text-xs">{activeDungeonName}</span>
              <button
                onClick={() => {
                  const items = PRECONFIG_DUNGEONS.filter((d) => d.zoneId === selectedZone.id);
                  const randomDungeon = items[Math.floor(Math.random() * items.length)]?.name || "The Clockwork Grotto";
                  setCustomDungeonName(randomDungeon);
                  if (soundEnabled) playSelect().catch(() => {});
                }}
                className="text-[9px] font-pixel text-amber-500 hover:text-amber-400 bg-amber-950/40 border border-amber-900/40 rounded px-1.5 py-1 transition-all flex items-center gap-1 active:scale-95"
                title="Shuffle dynamic dungeon selection based on zone"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Shuffle</span>
              </button>
            </div>

          </div>

          {/* Section: Saved Log Chronicles Area */}
          <div className="flex-1 min-h-[380px] h-full flex flex-col justify-end">
            <ResponseLog
              logs={logs}
              onClearLogs={handleClearLogs}
              onCopyText={handleCopyText}
            />
          </div>

        </div>

      </main>

      {/* Footer credits and information panel */}
      <footer className="py-6 px-4 max-w-7xl mx-auto w-full border-t border-[#8c6239]/20 text-center text-xs opacity-75 font-mono space-y-2 mt-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <p className="flex items-center gap-1 font-bold text-amber-300/90">
            <span>🛡️ Echoes of the Forgotten Kingdom</span>
            <span className="text-gray-600">|</span>
            <span className="font-normal italic">Lore Generator Core</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-black text-[#d4af37] border border-[#d4af37]/20 rounded text-[9px] font-pixel">2010 ZELDA ENGINE</span>
            <span className="px-1.5 py-0.5 bg-black text-[#d4af37] border border-[#d4af37]/20 rounded text-[9px] font-pixel uppercase">GEMINI 3.5 FLASH</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 max-w-2xl mx-auto leading-relaxed">
          This system provides clean character dialog configurations, ancient carvings, item documents, quest parameters, and menacing dialogue sets conforming exactly to the high-fantasy writing templates. Persistent storage managed via browser localStorage. All API queries execute strictly on Express.
        </p>
      </footer>
    </div>
  );
}
