import { NPCConfig, ZoneConfig } from "./types";

export const PRECONFIG_NPCS: NPCConfig[] = [
  {
    name: "Elder Kaepora",
    role: "elder",
    description: "A slow-speaking, owl-like elder who remembers the dawn of the Kingdom.",
    avatarEmoji: "🦉",
  },
  {
    name: "Torr",
    role: "blacksmith",
    description: "A burly, soot-covered blacksmith who values practical steel over ancient legends.",
    avatarEmoji: "⚒️",
  },
  {
    name: "Kiki",
    role: "child",
    description: "A hyper-active child running around seeking hidden golden spiders.",
    avatarEmoji: "🧒",
  },
  {
    name: "Malon",
    role: "shopkeeper",
    description: "A sweet-natured rancher who sings ancient lullabies to her horses.",
    avatarEmoji: "👩‍🌾",
  },
  {
    name: "Impa",
    role: "shadow guide",
    description: "A highly disciplined warrior guarding the royal lineage from the shadows.",
    avatarEmoji: "🧝‍♀️",
  },
  {
    name: "Malakor",
    role: "oracle",
    description: "A cloaked seer who traces the ancient stellar constellations with her glowing crystal.",
    avatarEmoji: "🔮",
  },
];

export const PRECONFIG_ZONES: ZoneConfig[] = [
  {
    id: "faron_woods",
    name: "Faron Woods",
    description: "A deep, misty woodland filled with ancient forest spirits.",
    bgHex: "#14532d",
  },
  {
    id: "eldin_volcano",
    name: "Eldin Volcano",
    description: "A treacherous volcano rich in iron ores and lakes of bubbling magma.",
    bgHex: "#7f1d1d",
  },
  {
    id: "lanayru_desert",
    name: "Lanayru Desert",
    description: "A vast sea of golden dust containing remnants of lost time-technologies.",
    bgHex: "#78350f",
  },
  {
    id: "lake_hylia",
    name: "Lake Hylia",
    description: "A majestic, crystal-clear lake surrounding the submerged Water Oracle ruins.",
    bgHex: "#1e3a8a",
  },
  {
    id: "shadow_citadel",
    name: "Shadow Citadel",
    description: "A ruined, twilight-shrouded fortress where history's whispers linger.",
    bgHex: "#3b0764",
  },
];

export const PRECONFIG_DUNGEONS = [
  { name: "The Stone Eye Canopy", zoneId: "faron_woods" },
  { name: "The Sunken Arboreal Sanctum", zoneId: "faron_woods" },
  { name: "The Obsidian Furnace", zoneId: "eldin_volcano" },
  { name: "The Fire Dragon's Maw", zoneId: "eldin_volcano" },
  { name: "The Hourglass Crypt", zoneId: "lanayru_desert" },
  { name: "The Chronos Refinery", zoneId: "lanayru_desert" },
  { name: "The Abyssal Reservoir", zoneId: "lake_hylia" },
  { name: "The Temple of Droplets", zoneId: "lake_hylia" },
  { name: "The Mausoleum of Whispers", zoneId: "shadow_citadel" },
  { name: "The Eclipse Palace", zoneId: "shadow_citadel" },
];

export const PRECONFIG_ITEMS = [
  { name: "Master Sword", type: "weapon" },
  { name: "Ocarina of Winds", type: "relic" },
  { name: "Mirror Shield", type: "armor" },
  { name: "Pegasus Boots", type: "accessory" },
  { name: "Grappling Hookshot", type: "tool" },
  { name: "Hero's Fire Bow", type: "weapon" },
  { name: "Lens of Truth", type: "tool" },
  { name: "Iron Boots", type: "accessory" },
];

export const INITIAL_LOG_ITEMS: any[] = [
  {
    id: "init_1",
    type: "dialogue",
    timestamp: "10:00 AM",
    npcName: "Elder Kaepora",
    npcRole: "village elder",
    zone: "Faron Woods",
    hearts: 3,
    quest: "The Awakening of the Sacred Stone",
    items: ["Master Sword"],
    text: "Ah, Link... At last, the ancient green tunic fits your shoulders. Hearken closely to the wind, for the forest whispers of a great shadow ascending the northern peaks.",
  },
  {
    id: "init_2",
    type: "quest",
    timestamp: "10:05 AM",
    questName: "The Awakening of the Sacred Stone",
    questGiver: "Elder Kaepora",
    objective: "Retrieve the emerald artifact from the Stone Eye Canopy.",
    title: "A Seed of Hope",
    description: "Deep within the dense canopy of Farore's Woods lies the ancient Stone Eye, holding the emerald catalyst of natural life. You must retrieve it before the shadows overtake the roots of the world tree.",
    rewardHint: "A permanent physical boost to your stamina or a mystical flask.",
  },
];
