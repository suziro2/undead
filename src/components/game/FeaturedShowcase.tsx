"use client";

import React from "react";
import ArtImage from "@/components/game/ArtImage";
import { HEROES } from "@/lib/gameData";
import { sounds } from "@/lib/soundEffects";
import {
  RARITY_STYLE,
  FEATURED_HERO_XP_BONUS,
  FEATURED_HERO_COIN_BONUS,
  isEventBonusClaimed,
  type FeaturedEvent,
  type FeaturedHeroEntry,
  type FeaturedState,
} from "@/lib/featured";
import {
  Sparkles,
  Star,
  Swords,
  Lock,
  Coins,
  Zap,
  Play,
  Users,
  Clock,
  CheckCircle2,
  Flame,
} from "lucide-react";

interface FeaturedShowcaseProps {
  progress: any;
  spotlight: FeaturedHeroEntry;
  roster: FeaturedHeroEntry[];
  events: FeaturedEvent[];
  featuredState: FeaturedState;
  rewardToast?: string | null;
  onSelectHero: (heroId: string) => void;
  onUnlockHero: (heroId: string, cost: number) => void;
  onOpenRoster: () => void;
  onStartEvent: (event: FeaturedEvent) => void;
}

const Stars = ({ count, color }: { count: number; color: string }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${count} star rating`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-3 h-3"
        style={{ color: i < count ? color : "#3f3f46" }}
        fill={i < count ? color : "transparent"}
      />
    ))}
  </span>
);

export default function FeaturedShowcase({
  progress,
  spotlight,
  roster,
  events,
  featuredState,
  rewardToast,
  onSelectHero,
  onUnlockHero,
  onOpenRoster,
  onStartEvent,
}: FeaturedShowcaseProps) {
  const hero = HEROES[spotlight.heroId];
  const rarity = RARITY_STYLE[spotlight.rarity];
  if (!hero) return null;

  const unlocked = (progress?.unlockedHeroes || []).includes(hero.id);
  const selected = progress?.selectedHeroId === hero.id;
  const coins = progress?.coins || 0;
  const affordable = coins >= hero.unlockCost;

  const skillTint = hero.skill.color || hero.accentColor;

  return (
    <section className="relative">
      {/* section header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Featured
        </h2>
        <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Refreshes daily
        </span>
      </div>

      {rewardToast && (
        <div className="mb-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-[11px] text-emerald-200 font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {rewardToast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ============ SPOTLIGHT HERO ============ */}
        <div
          className="lg:col-span-7 featured-frame rounded-3xl p-1.5 shadow-2xl"
          style={{ boxShadow: `0 30px 80px -40px ${rarity.glow}` }}
        >
          <div className="featured-frame__inner rounded-[20px] relative overflow-hidden p-4 sm:p-6">
            <div
              className="absolute inset-0 pointer-events-none opacity-70"
              style={{
                background: `radial-gradient(120% 90% at 12% 0%, ${hero.color}55, transparent 62%), radial-gradient(90% 80% at 100% 100%, ${rarity.ring}22, transparent 60%)`,
              }}
            />
            <div className="absolute inset-0 featured-shine pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row gap-5">
              {/* ornate portrait */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div
                  className="w-36 h-44 sm:w-44 sm:h-52 rounded-2xl overflow-hidden border-2 relative"
                  style={{
                    borderColor: rarity.ring,
                    backgroundColor: hero.color,
                    boxShadow: `0 18px 46px -18px ${rarity.glow}, inset 0 0 0 2px rgba(0,0,0,0.45)`,
                  }}
                >
                  <ArtImage
                    src={hero.image}
                    alt={hero.name}
                    fallbackText={hero.classIcon}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute bottom-1.5 inset-x-0 text-center">
                    <Stars count={spotlight.stars} color={rarity.ring} />
                  </div>
                </div>

                {/* FEATURED ribbon */}
                <div className="featured-ribbon absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-[3px] rounded-full text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap">
                  ★ Featured
                </div>
                <div
                  className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${rarity.chip} ${rarity.text} backdrop-blur`}
                >
                  {rarity.label}
                </div>
              </div>

              {/* hero copy */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow">{hero.name}</h3>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
                    style={{ backgroundColor: `${hero.color}25`, color: hero.accentColor, borderColor: hero.accentColor }}
                  >
                    {hero.classIcon} {hero.classType}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-semibold mt-0.5">{hero.title}</p>
                <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                  {spotlight.tagline} — {spotlight.highlight}
                </p>

                {/* featured perk */}
                <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 flex items-start gap-2 text-left">
                  <Flame className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-200 uppercase tracking-wide">Featured perk</span>
                    <span className="text-neutral-300">
                      {" "}— deploy {hero.name} on campaign stages for{" "}
                      <span className="text-amber-300 font-bold">+{Math.round(FEATURED_HERO_XP_BONUS * 100)}% XP</span> and{" "}
                      <span className="text-amber-300 font-bold">+{Math.round(FEATURED_HERO_COIN_BONUS * 100)}% coins</span>.
                    </span>
                  </div>
                </div>

                {/* stats */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: "HP", value: hero.stats.hp, color: "text-emerald-400" },
                    { label: "ATK", value: hero.stats.atk, color: "text-rose-400" },
                    { label: "DEF", value: hero.stats.def, color: "text-sky-400" },
                    { label: "SPD", value: hero.stats.spd, color: "text-amber-300" },
                  ].map((st) => (
                    <div key={st.label} className="bg-black/45 border border-white/10 rounded-xl py-1.5 text-center">
                      <div className="text-[9px] text-neutral-400 uppercase font-semibold">{st.label}</div>
                      <div className={`text-[11px] font-mono font-bold ${st.color}`}>{st.value}</div>
                    </div>
                  ))}
                </div>

                {/* skill */}
                <div className="flex items-center gap-2 mt-2.5 rounded-xl border px-3 py-2" style={{ borderColor: `${skillTint}66`, backgroundColor: `${skillTint}12` }}>
                  <span className="text-base">{hero.skill.icon}</span>
                  <span className="text-[11px] font-bold" style={{ color: skillTint }}>{hero.skill.name}</span>
                  <span className="text-[10px] text-neutral-400 truncate">{hero.skill.description}</span>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {!unlocked ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        if (affordable) onUnlockHero(hero.id, hero.unlockCost);
                      }}
                      disabled={!affordable}
                      className={`btn-3d flex-1 min-w-[190px] py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 ${
                        affordable
                          ? "featured-cta text-black"
                          : "bg-neutral-800 border border-white/10 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      {affordable ? (
                        <>
                          <Coins className="w-4 h-4" /> Recruit · {hero.unlockCost.toLocaleString()}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> {hero.unlockCost.toLocaleString()} coins needed
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        if (selected) {
                          // Already deployed: jump straight into the headline featured run.
                          onStartEvent(events[0]);
                        } else {
                          onSelectHero(hero.id);
                        }
                      }}
                      className={`btn-3d flex-1 min-w-[190px] py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 ${
                        selected ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "featured-cta text-black"
                      }`}
                    >
                      {selected ? (
                        <>
                          <Zap className="w-4 h-4" /> Enter Featured Run
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> Deploy This Hero
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onOpenRoster();
                    }}
                    className="btn-3d px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" /> All Classes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ FEATURED EVENTS ============ */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {events.map((event) => {
            const claimed = isEventBonusClaimed(event.kind, featuredState);
            return (
              <div
                key={event.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition p-4 flex gap-3.5 shadow-xl"
                style={{ boxShadow: `0 18px 44px -34px ${event.accent}` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: `${event.accent}1f`, borderColor: `${event.accent}80` }}
                >
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white uppercase tracking-wide">{event.title}</span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0"
                      style={{ color: event.accent, borderColor: `${event.accent}80`, backgroundColor: `${event.accent}18` }}
                    >
                      {event.rewardLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">{event.subtitle}</div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">{event.description}</p>
                  <div className="flex items-center justify-between gap-2 mt-2.5">
                    <span className="text-[10px] font-semibold flex items-center gap-1.5">
                      {event.kind === "endless" ? (
                        <span className="text-purple-300 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Best run: {featuredState.endlessBestRooms || 0} rooms
                        </span>
                      ) : claimed ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Daily chest claimed
                        </span>
                      ) : (
                        <span className="text-amber-300 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> First clear +{event.firstClearChest.toLocaleString()}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onStartEvent(event);
                      }}
                      className="btn-3d px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-black"
                      style={{ background: `linear-gradient(180deg, ${event.accent}, ${event.accent}bb)` }}
                    >
                      <Play className="w-3 h-3 fill-current" /> Enter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ FEATURED ROSTER STRIP ============ */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-400" /> Featured Mercenaries
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenRoster();
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition"
          >
            View all 10 classes →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {roster.map((entry) => {
            const entryHero = HEROES[entry.heroId];
            const entryRarity = RARITY_STYLE[entry.rarity];
            const isUnlocked = (progress?.unlockedHeroes || []).includes(entry.heroId);
            const isSelected = progress?.selectedHeroId === entry.heroId;
            return (
              <button
                key={entry.heroId}
                onClick={() => {
                  sounds.playClick();
                  onOpenRoster();
                }}
                className="group rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5 bg-black/40"
                style={{
                  borderColor: isSelected ? entryHero.accentColor : `${entryRarity.ring}55`,
                  boxShadow: isSelected ? `0 0 0 1px ${entryHero.accentColor}, 0 16px 40px -26px ${entryRarity.glow}` : `0 14px 34px -30px ${entryRarity.glow}`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border shrink-0 relative"
                    style={{ borderColor: entryRarity.ring, backgroundColor: entryHero.color }}
                  >
                    <ArtImage src={entryHero.image} alt={entryHero.name} fallbackText={entryHero.classIcon} className="w-full h-full object-cover object-top" />
                    {!isUnlocked && (
                      <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-neutral-300" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {entryHero.name}
                    </div>
                    <div className="text-[9px] text-neutral-400 truncate">{entryHero.classType}</div>
                    <div className="mt-0.5">
                      <Stars count={entry.stars} color={entryRarity.ring} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wide">
                  <span className={entryRarity.text}>{entryRarity.label}</span>
                  <span className={isUnlocked ? "text-emerald-400" : "text-neutral-500"}>
                    {isUnlocked ? (isSelected ? "Deployed" : "Ready") : `${entryHero.unlockCost.toLocaleString()}🪙`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
