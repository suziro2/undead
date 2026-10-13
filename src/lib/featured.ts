/**
 * FEATURED content system.
 *
 * The hub shows a rotating "Featured" spotlight (like the FEATURED banner in the
 * reference art): a Hero of the Day plus three limited-time events that launch
 * real, playable runs with boosted rewards.
 *
 * Everything here is deterministic per calendar day so the rotation feels
 * curated ("refreshes daily") while staying identical for every player.
 */

import { CHAPTERS, HEROES } from "./gameData";

export type FeaturedRarity = "legendary" | "epic" | "rare";

export interface FeaturedHeroEntry {
  heroId: string;
  rarity: FeaturedRarity;
  /** 1..5 star display rating */
  stars: number;
  tagline: string;
  highlight: string;
}

/** Reward boost applied to campaign runs while the featured hero is deployed. */
export const FEATURED_HERO_XP_BONUS = 0.25;
export const FEATURED_HERO_COIN_BONUS = 0.1;

export const RARITY_STYLE: Record<
  FeaturedRarity,
  { label: string; ring: string; glow: string; text: string; chip: string }
> = {
  legendary: {
    label: "Legendary",
    ring: "#fbbf24",
    glow: "rgba(251,191,36,0.55)",
    text: "text-amber-300",
    chip: "bg-amber-500/15 border-amber-400/50",
  },
  epic: {
    label: "Epic",
    ring: "#c084fc",
    glow: "rgba(192,132,252,0.5)",
    text: "text-purple-300",
    chip: "bg-purple-500/15 border-purple-400/50",
  },
  rare: {
    label: "Rare",
    ring: "#60a5fa",
    glow: "rgba(96,165,250,0.5)",
    text: "text-sky-300",
    chip: "bg-sky-500/15 border-sky-400/50",
  },
};

export const FEATURED_HEROES: FeaturedHeroEntry[] = [
  { heroId: "aiden", rarity: "rare", stars: 3, tagline: "The dawn's first blade", highlight: "Balanced melee frontline with a spinning cleave." },
  { heroId: "luna", rarity: "rare", stars: 3, tagline: "One shot, one shadow", highlight: "Longest range in the roster — kite bosses from safety." },
  { heroId: "ronan", rarity: "epic", stars: 4, tagline: "Fury made flesh", highlight: "Furious combo melts elites before they can swing." },
  { heroId: "mira", rarity: "epic", stars: 4, tagline: "Scholar of the storm", highlight: "Nukes entire rooms with elemental barrage." },
  { heroId: "kael", rarity: "epic", stars: 4, tagline: "Death from the dark", highlight: "Shadow dash repositions behind any target instantly." },
  { heroId: "bruno", rarity: "epic", stars: 4, tagline: "The wall that walks", highlight: "Ground slam staggers packs and shrugs off damage." },
  { heroId: "sylvie", rarity: "legendary", stars: 5, tagline: "Voice of the Elder Grove", highlight: "Thorn heal keeps long Endless Trials alive." },
  { heroId: "darius", rarity: "legendary", stars: 5, tagline: "Knight of the abyss", highlight: "Dark wave punishes everything in a wide arc." },
  { heroId: "elian", rarity: "legendary", stars: 5, tagline: "Tempest incarnate", highlight: "Chain lightning ricochets across whole formations." },
  { heroId: "riven", rarity: "legendary", stars: 5, tagline: "Breath of the dragon", highlight: "Dragon flame deletes boss phases outright." },
];

/** Days since the unix epoch in the player's local timezone. */
export function dayIndex(date: Date = new Date()): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

/** Stable local-time key for "once per day" bookkeeping. */
export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The rotating hero of the day.
 * When the player's roster is supplied the spotlight prefers classes they can
 * actually deploy, so the FEATURED card is never a dead end for new slayers.
 */
export function getFeaturedHero(date: Date = new Date(), unlockedHeroIds?: string[]): FeaturedHeroEntry {
  const owned = (unlockedHeroIds || []).filter((id) => FEATURED_HEROES.some((h) => h.heroId === id));
  const pool = owned.length ? FEATURED_HEROES.filter((h) => owned.includes(h.heroId)) : FEATURED_HEROES;
  return pool[dayIndex(date) % pool.length];
}

/** Four-card showcase strip: the spotlight hero followed by the next picks. */
export function getFeaturedRoster(date: Date = new Date(), count = 4): FeaturedHeroEntry[] {
  const start = dayIndex(date) % FEATURED_HEROES.length;
  return Array.from({ length: count }, (_, i) => FEATURED_HEROES[(start + i) % FEATURED_HEROES.length]);
}

/* ------------------------------------------------------------------ */
/* Featured events                                                     */
/* ------------------------------------------------------------------ */

export type FeaturedEventKind = "daily" | "bossRush" | "endless";

/** Extra run configuration handed to the battle engine. */
export interface FeaturedModeConfig {
  kind: "campaign" | FeaturedEventKind;
  label: string;
  /** Final gold / XP multiplier for the whole run. */
  rewardMultiplier: number;
  /** Overrides the stage room count (endless trials run far longer). */
  roomCount?: number;
  /** Extra enemy HP/ATK scaling applied for every room past the first. */
  scalePerRoom?: number;
  /** Spawn the chapter boss in the final room even on a non-boss stage. */
  bossFinale?: boolean;
  /** Bonus coins awarded for every room cleared. */
  perRoomBonus?: number;
  accent?: string;
}

export interface FeaturedEvent {
  id: string;
  kind: FeaturedEventKind;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: string;
  /** e.g. "×2 coins" */
  rewardLabel: string;
  chapterId: number;
  levelNumber: number;
  stageLabel: string;
  mode: FeaturedModeConfig;
  /** Coins awarded on the first clear of the day. */
  firstClearChest: number;
}

export interface FeaturedState {
  dailyClaimedOn?: string;
  bossRushClaimedOn?: string;
  endlessBestRooms?: number;
  lastPlayedEventId?: string;
}

const STATE_KEY = "undead_slayer_featured_v1";

export function loadFeaturedState(): FeaturedState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as FeaturedState) : {};
  } catch {
    return {};
  }
}

export function saveFeaturedState(state: FeaturedState): FeaturedState {
  if (typeof window === "undefined") return state;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* storage disabled — featured bonuses simply won't persist */
  }
  return state;
}

export function isEventBonusClaimed(eventId: FeaturedEventKind, state: FeaturedState, date = new Date()): boolean {
  const today = todayKey(date);
  if (eventId === "daily") return state.dailyClaimedOn === today;
  if (eventId === "bossRush") return state.bossRushClaimedOn === today;
  return false;
}

export function markEventBonusClaimed(state: FeaturedState, eventId: FeaturedEventKind, date = new Date()): FeaturedState {
  const today = todayKey(date);
  const next: FeaturedState = { ...state, lastPlayedEventId: eventId };
  if (eventId === "daily") next.dailyClaimedOn = today;
  if (eventId === "bossRush") next.bossRushClaimedOn = today;
  return saveFeaturedState(next);
}

/**
 * Build the three featured events for today.
 * Locked content is gracefully clamped to whatever the player has unlocked so
 * the FEATURED row is always playable.
 */
export function getFeaturedEvents(progress: {
  highestChapterUnlocked?: number;
  highestLevelUnlocked?: number;
} | null): FeaturedEvent[] {
  const highestChapter = Math.min(Math.max(progress?.highestChapterUnlocked || 1, 1), CHAPTERS.length);
  const dailyChapter = ((dayIndex() % highestChapter) + 1) || 1;

  const daily: FeaturedEvent = {
    id: "daily-dungeon",
    kind: "daily",
    title: "Daily Dungeon",
    subtitle: `Chapter ${dailyChapter} · Cursed Vault`,
    description:
      "A rotating cursed vault packed with double-loot monsters. Clear the first run each day for a bonus coin chest.",
    icon: "🗝️",
    accent: "#fbbf24",
    rewardLabel: "×2 coins & XP",
    chapterId: dailyChapter,
    levelNumber: 3,
    stageLabel: `Ch ${dailyChapter} · Stage 3`,
    firstClearChest: 250 + dailyChapter * 150,
    mode: {
      kind: "daily",
      label: "Daily Dungeon",
      rewardMultiplier: 2,
      accent: "#fbbf24",
    },
  };

  const bossRush: FeaturedEvent = {
    id: "boss-rush",
    kind: "bossRush",
    title: "Boss Rush",
    subtitle: `${CHAPTERS[highestChapter - 1].boss.name} awaits`,
    description:
      "Skip the fodder and drop straight into the throne room. Half again the loot, all of the danger.",
    icon: "👑",
    accent: "#f43f5e",
    rewardLabel: "×1.5 coins & XP",
    chapterId: highestChapter,
    levelNumber: 5,
    stageLabel: `Ch ${highestChapter} · Boss`,
    firstClearChest: 400 + highestChapter * 200,
    mode: {
      kind: "bossRush",
      label: "Boss Rush",
      rewardMultiplier: 1.5,
      accent: "#f43f5e",
    },
  };

  const endlessChapter = Math.max(1, Math.min(highestChapter, 4));
  const endless: FeaturedEvent = {
    id: "endless-trial",
    kind: "endless",
    title: "Endless Trial",
    subtitle: `Chapter ${endlessChapter} · 8 escalating rooms`,
    description:
      "Every room hits harder than the last and champions the chapter boss in the finale. Deep runs pay the most.",
    icon: "♾️",
    accent: "#a855f7",
    rewardLabel: "×2 coins & XP + room bonus",
    chapterId: endlessChapter,
    levelNumber: 4,
    stageLabel: `Ch ${endlessChapter} · Trial`,
    firstClearChest: 300,
    mode: {
      kind: "endless",
      label: "Endless Trial",
      rewardMultiplier: 2,
      roomCount: 8,
      scalePerRoom: 0.16,
      bossFinale: true,
      perRoomBonus: 60,
      accent: "#a855f7",
    },
  };

  return [daily, bossRush, endless];
}

/** True when the given hero is today's FEATURED spotlight pick. */
export function isHeroFeatured(heroId: string, date: Date = new Date(), unlockedHeroIds?: string[]): boolean {
  return getFeaturedHero(date, unlockedHeroIds).heroId === heroId && !!HEROES[heroId];
}
