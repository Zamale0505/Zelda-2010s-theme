export interface GameContext {
  player_name: string;
  player_hearts: number;
  player_items: string[];
  current_zone: string;
  active_quest: string;
  npc_name: string;
  npc_role: string;
}

export type ResponseMode = "npc_dialogue" | "dungeon_hint" | "quest_description" | "boss_taunt" | "item_lore";

export interface DialogueLogItem {
  id: string;
  type: "dialogue";
  timestamp: string;
  npcName: string;
  npcRole: string;
  npcAvatarUrl?: string; // We'll generate nice avatar labels
  zone: string;
  hearts: number;
  quest: string;
  items: string[];
  text: string;
}

export interface HintLogItem {
  id: string;
  type: "hint";
  timestamp: string;
  dungeonName: string;
  zone: string;
  text: string;
}

export interface QuestLogItem {
  id: string;
  type: "quest";
  timestamp: string;
  questName: string;
  questGiver: string;
  objective: string;
  title: string;
  description: string;
  rewardHint: string;
}

export interface BossLogItem {
  id: string;
  type: "boss";
  timestamp: string;
  bossName: string;
  bossPhase: number;
  text: string;
}

export interface ItemLoreLogItem {
  id: string;
  type: "item_lore";
  timestamp: string;
  itemName: string;
  itemType: string;
  name: string;
  lore: string;
  effectHint: string;
}

export type LogItem = DialogueLogItem | HintLogItem | QuestLogItem | BossLogItem | ItemLoreLogItem;

export interface NPCConfig {
  name: string;
  role: string;
  description: string;
  avatarEmoji: string;
}

export interface ZoneConfig {
  id: string;
  name: string;
  description: string;
  bgHex: string;
}
