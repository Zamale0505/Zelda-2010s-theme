let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Ensure the audio context is active (handles user gesture requirements)
async function resumeContext(ctx: AudioContext): Promise<boolean> {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
}

export async function playLetterBlip() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Zelda letter typing text reveals are short, slightly noise-like or triangle waves
  osc.type = "sine";
  osc.frequency.setValueAtTime(440, ctx.currentTime); // Mid pitch
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.015, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export async function playSelect() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(330, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export async function playHeartChange(gainHeart: boolean) {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  if (gainHeart) {
    // Gain heart sound: beautiful clean double pitch (D6 -> F6)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(698.46, ctx.currentTime + 0.08); // F5
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  } else {
    // Lose heart: short warning buzzer sound (Bb2 -> G2)
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(233.08, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(196, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  }

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export async function playJingleSuccess() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;
  const playNote = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.04, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  };

  // Zelda Puzzle Solve Jingle: G5, F#5, D#5, A4, G#5, E5, G#5, C6 (very fast and iconic)
  const notes = [784, 740, 622, 440, 831, 659, 831, 1047];
  const duration = 0.08;
  notes.forEach((note, index) => {
    playNote(note, now + index * (duration - 0.01), duration);
  });
}

export async function playQuestDiscovery() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await resumeContext(ctx);

  const now = ctx.currentTime;
  const playNote = (freq: number, start: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.01);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  };

  // Zelda Quest/Item Discovery Fanfare: G4 -> C5 -> E5 -> G5 (arp) -> A5 (accent peak)
  const notes = [392, 523, 659, 784, 880];
  const duration = 0.15;
  notes.forEach((note, index) => {
    playNote(note, now + index * 0.12, index === 4 ? 0.4 : 0.15);
  });
}
