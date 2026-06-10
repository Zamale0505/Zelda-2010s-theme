import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured or holds a placeholder. Please configure it in your Secrets panel in the AI Studio UI.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. NPC Dialogue endpoint
app.post("/api/generate/dialogue", async (req, res) => {
  try {
    const { player_name, player_hearts, player_items, current_zone, active_quest, npc_name, npc_role, situational_context } = req.body;
    const ai = getGeminiClient();

    const itemsStr = Array.isArray(player_items) && player_items.length > 0 ? player_items.join(", ") : "no special equipment";

    const prompt = `You are roleplaying as the NPC "${npc_name}" who is a "${npc_role}" in a 2010-era Zelda-style RPG game.
Current context:
- Hero's Name: ${player_name}
- Hero's HP: ${player_hearts} / 12 hearts
- Hero's Items: ${itemsStr}
- Current Location/Zone: ${current_zone}
- Active Quest Status: ${active_quest || "No active quest"}
${situational_context ? `- Situational prompt override (use this for extra flavor if provided): ${situational_context}` : ""}

Ensure you speak strictly as ${npc_name}, staying 100% in character with the respective role personality (e.g. an elder is wise and slow; a blacksmith is blunt and grumpy; a child is curious and excited; a shopkeeper is upbeat and rupee-focused). No modern terms, no fourth-wall breaches, no quotes, no stage directions/descriptions. Talk directly to the player. Keep it under 3 sentences (ideally 1-2 sentences).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the character dialouge engine inside a high-fantasy medieval retro RPG. You must output only what the NPC says. Strict, literal speech without quotes, actions, or stage directions. No meta commentary.",
        temperature: 0.85,
      },
    });

    const dialogueText = response.text?.trim() || "Thank goodness you arrived, hero!";
    res.json({ text: dialogueText });
  } catch (error: any) {
    console.error("Dialogue generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate dialogue." });
  }
});

// 2. Dungeon Hint endpoint
app.post("/api/generate/hint", async (req, res) => {
  try {
    const { dungeon_name, current_zone } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate an ancient, cryptic, poetic hint carved in stone for the dungeon "${dungeon_name}" in the zone "${current_zone}".
The hint should feel like an ancient riddle or poem, pointing at a secret mechanism, item, or obstacle (e.g. shooting an arrow at an eye, playing a specific song on an instrument, lighting torches in a certain order, or finding a mirror).
Output exactly ONE cryptic sentence of carved-in-stone style hint. No stage directions, no quotes. Keep it short.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an ancient stone inscription carver. You only speak in highly cryptic, poetic medieval runes. Exactly 1 sentence.",
        temperature: 0.9,
      },
    });

    res.json({ text: response.text?.trim() || "The path reveals itself only to those who feed the flame first." });
  } catch (error: any) {
    console.error("Dungeon hint generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate hint." });
  }
});

// 3. Quest Description endpoint (JSON schema enforced)
app.post("/api/generate/quest", async (req, res) => {
  try {
    const { quest_name, quest_giver, objective } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a Zelda-style adventure quest.
- Name: ${quest_name}
- Giver: ${quest_giver}
- Objective: ${objective}

Create a beautifully styled retro objective log. Write a short creative, high-fantasy description explaining why this quest matters in-universe, and a fun cryptic reward hint (like a mysterious item or upgrade). Make sure to return valid JSON fitting the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Quest Log writer for an ancient realm. Write immersive, dramatic quest entries with an engaging folk-tale style of under 3 sentences. Return perfect JSON matching the specified schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "reward_hint"],
          properties: {
            title: {
              type: Type.STRING,
              description: "The official in-world title of the quest.",
            },
            description: {
              type: Type.STRING,
              description: "A short, lore-rich narrative setup and objective explanation.",
            },
            reward_hint: {
              type: Type.STRING,
              description: "A cryptic, exciting clue about what rewards are granted upon completion.",
            }
          }
        },
        temperature: 0.8,
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Quest generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quest description." });
  }
});

// 4. Boss Taunt endpoint
app.post("/api/generate/boss", async (req, res) => {
  try {
    const { boss_name, boss_phase, player_name } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a dramatic, theatrical, and menacing boss battle taunt for the sinister boss "${boss_name}" at Phase ${boss_phase} of the duel.
Addressing player: ${player_name}.
The taunt should match the phase intensity:
- Phase 1: Arrogant, mocking, dismissing the hero.
- Phase 2: Angered, surprised by their grit, turning up the heat.
- Phase 3: Enraged, desperate, absolute apocalyptic rage!
Output exactly 1 theatrical taunt line of dialogue, up to 3 sentences max. Do not use quotes or action lines.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an ancient theatrical boss. You speak in a highly dramatic, menacing, grand-scale villainous monologue. Under 3 sentences. No quotes or stage actions.",
        temperature: 0.9,
      },
    });

    res.json({ text: response.text?.trim() || "You have come far, child, but your quest ends in ash!" });
  } catch (error: any) {
    console.error("Boss taunt generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate boss taunt." });
  }
});

// 5. Item Lore endpoint (JSON schema enforced)
app.post("/api/generate/item", async (req, res) => {
  try {
    const { item_name, item_type } = req.body;
    const ai = getGeminiClient();

    const prompt = `Create an item log for an iconic fantasy relic:
- Name: ${item_name}
- Type: ${item_type}

Provide a short, highly evocative, mysterious lore description (1-2 sentences), and a mysterious tooltip-style effect hint. Deliver as JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an ancient archivist cataloging mythical artifacts. Write evocative, poetic, short history blocks for legendary loot and artifacts.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["name", "lore", "effect_hint"],
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the mythical item.",
            },
            lore: {
              type: Type.STRING,
              description: "A highly mysterious, poetic lore background of 1-2 sentences.",
            },
            effect_hint: {
              type: Type.STRING,
              description: "A short, cryptic gameplay mechanic hint of what the item can do.",
            }
          }
        },
        temperature: 0.8,
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Item lore generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate item lore." });
  }
});

// Setup Vite / Static serve middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
