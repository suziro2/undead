/**
 * Offline / Guest Slayer profile.
 *
 * The game must be fully playable even when the Postgres-backed cloud save is
 * unavailable (local preview sandboxes, a Vercel deploy without DATABASE_URL,
 * offline sessions). Guest progress mirrors the server row exactly and is kept
 * in localStorage so refreshing the page resumes the adventure.
 */

import { DEFAULT_INVENTORY_ITEMS } from "./gameData";

export const GUEST_USER = { id: 0, username: "Guest Slayer" };
export const GUEST_STORAGE_KEY = "undead_slayer_guest_progress_v1";

export interface StatUpgrades {
  attackLevel: number;
  healthLevel: number;
  defenseLevel: number;
  skillLevel: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  autoTarget: boolean;
  screenShake: boolean;
  damageNumbers: boolean;
}

export interface GameProgress {
  level: number;
  xp: number;
  coins: number;
  healthPotions: number;
  selectedHeroId: string;
  highestChapterUnlocked: number;
  highestLevelUnlocked: number;
  completedLevels: string[];
  unlockedHeroes: string[];
  heroLevels: Record<string, number>;
  statUpgrades: StatUpgrades;
  inventory: any[];
  settings: GameSettings;
}

/** Same defaults the register endpoint writes, so guest and cloud saves match. */
export function createDefaultProgress(overrides: Partial<GameProgress> = {}): GameProgress {
  return {
    level: 1,
    xp: 0,
    coins: 600,
    healthPotions: 5,
    selectedHeroId: "aiden",
    highestChapterUnlocked: 1,
    highestLevelUnlocked: 1,
    completedLevels: [],
    unlockedHeroes: ["aiden", "luna"],
    heroLevels: {
      aiden: 1, luna: 1, ronan: 1, mira: 1, kael: 1,
      bruno: 1, sylvie: 1, darius: 1, elian: 1, riven: 1,
    },
    statUpgrades: { attackLevel: 1, healthLevel: 1, defenseLevel: 1, skillLevel: 1 },
    inventory: DEFAULT_INVENTORY_ITEMS.map((item) => ({ ...item })),
    settings: {
      musicVolume: 70,
      sfxVolume: 80,
      autoTarget: true,
      screenShake: true,
      damageNumbers: true,
    },
    ...overrides,
  };
}

function coerceProgress(value: any): GameProgress | null {
  if (!value || typeof value !== "object") return null;
  if (typeof value.coins !== "number" || typeof value.selectedHeroId !== "string") return null;
  const defaults = createDefaultProgress();
  return {
    ...defaults,
    ...value,
    statUpgrades: { ...defaults.statUpgrades, ...(value.statUpgrades || {}) },
    settings: { ...defaults.settings, ...(value.settings || {}) },
    heroLevels: { ...defaults.heroLevels, ...(value.heroLevels || {}) },
    completedLevels: Array.isArray(value.completedLevels) ? value.completedLevels : [],
    unlockedHeroes: Array.isArray(value.unlockedHeroes) && value.unlockedHeroes.length ? value.unlockedHeroes : defaults.unlockedHeroes,
    inventory: Array.isArray(value.inventory) ? value.inventory : defaults.inventory,
  };
}

export function loadGuestProgress(): GameProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return null;
    return coerceProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveGuestProgress(progress: GameProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked — the in-memory session still works */
  }
}

export function clearGuestProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
