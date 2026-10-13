"use client";

import React, { useEffect } from "react";
import ArtImage from "@/components/game/ArtImage";
import { CHAPTERS, HEROES } from "@/lib/gameData";
import { sounds } from "@/lib/soundEffects";
import confetti from "canvas-confetti";
import { Crown, Trophy, Sparkles, Swords, Coins, Users, Heart, Star, Infinity as InfinityIcon } from "lucide-react";

interface EpilogueModalProps {
  progress: any;
  onClose: () => void;
  onEndlessTrial?: () => void;
}

/**
 * End-of-campaign epilogue: shown after the Chapter 5 boss falls (and re-openable
 * from the sanctuary once all 25 stages are cleared). Gives the run a real ending.
 */
export default function EpilogueModal({ progress, onClose, onEndlessTrial }: EpilogueModalProps) {
  const finalChapter = CHAPTERS[CHAPTERS.length - 1];
  const unlockedHeroes: string[] = progress?.unlockedHeroes || [];
  const cleared: string[] = progress?.completedLevels || [];
  const totalStages = CHAPTERS.reduce((sum, c) => sum + c.levels.length, 0);
  const slayer = HEROES[progress?.selectedHeroId] || HEROES.aiden;

  useEffect(() => {
    sounds.playVictory();
    try {
      confetti({ particleCount: 160, spread: 96, origin: { y: 0.4 } });
      const t = window.setTimeout(
        () => confetti({ particleCount: 120, spread: 120, origin: { y: 0.55 }, angle: 90 }),
        700
      );
      return () => window.clearTimeout(t);
    } catch {
      /* confetti is decorative */
    }
  }, []);

  const stats = [
    { icon: Swords, label: "Stages Cleared", value: `${cleared.length}/${totalStages}`, tint: "text-rose-300" },
    { icon: Users, label: "Classes Recruited", value: `${unlockedHeroes.length}/${Object.keys(HEROES).length}`, tint: "text-sky-300" },
    { icon: Trophy, label: "Slayer Rank", value: `Lv.${progress?.level || 1}`, tint: "text-amber-300" },
    { icon: Coins, label: "Gold Hoarded", value: `${(progress?.coins || 0).toLocaleString()}`, tint: "text-yellow-300" },
    { icon: Heart, label: "Potions Left", value: `${progress?.healthPotions || 0}`, tint: "text-red-300" },
    { icon: Sparkles, label: "XP Earned", value: `${(progress?.xp || 0).toLocaleString()}`, tint: "text-cyan-300" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="featured-frame rounded-3xl p-1.5 w-full max-w-3xl my-auto shadow-2xl">
        <div className="featured-frame__inner rounded-[20px] relative overflow-hidden p-6 sm:p-9 text-center">
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, rgba(251,191,36,0.20), transparent 60%), radial-gradient(90% 80% at 50% 110%, rgba(168,85,247,0.18), transparent 60%)",
            }}
          />
          <div className="absolute inset-0 featured-shine pointer-events-none" />

          <div className="relative">
            <div className="featured-ribbon inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.22em]">
              <Crown className="w-3.5 h-3.5" /> Campaign Complete
            </div>

            <h2 className="mt-4 text-2xl sm:text-4xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400">
              The Realm Is Saved
            </h2>
            <p className="text-[11px] sm:text-xs text-amber-200/80 font-semibold mt-2">
              Chapter V — {finalChapter.subtitle}
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed mt-3 max-w-xl mx-auto">
              {finalChapter.boss.name} has fallen and the shadow tide breaks over {slayer.name}&apos;s blade.
              Five chapters, twenty-five stages and five warlords later, the undead host is scattered.
              But the void never truly closes — the Featured Endless Trial waits for those who still hunger for glory.
            </p>

            {/* hero + final boss */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5">
              <div className="text-center">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 mx-auto"
                  style={{ borderColor: slayer.accentColor, backgroundColor: slayer.color }}
                >
                  <ArtImage src={slayer.image} alt={slayer.name} fallbackText={slayer.classIcon} className="w-full h-full object-cover object-top" />
                </div>
                <div className="text-[10px] font-bold text-white mt-1.5">{slayer.name}</div>
                <div className="text-[9px] text-neutral-400 uppercase tracking-wide">Realm&apos;s Champion</div>
              </div>
              <div className="text-amber-400 font-black text-lg">VS</div>
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-red-700/70 bg-black/50 mx-auto opacity-70 grayscale-[35%]">
                  <ArtImage src={finalChapter.boss.image} alt={finalChapter.boss.name} fallbackText="☠" className="w-full h-full object-cover object-top" />
                </div>
                <div className="text-[10px] font-bold text-neutral-400 mt-1.5 line-through">{finalChapter.boss.name}</div>
                <div className="text-[9px] text-red-400/80 uppercase tracking-wide">Defeated</div>
              </div>
            </div>

            {/* stat grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
              {stats.map(({ icon: Icon, label, value, tint }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/45 px-3 py-2.5">
                  <Icon className={`w-4 h-4 mx-auto ${tint}`} />
                  <div className="text-[9px] text-neutral-400 uppercase font-semibold mt-1">{label}</div>
                  <div className={`text-xs font-mono font-bold ${tint}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* recruited heroes strip */}
            <div className="mt-5">
              <div className="text-[9px] uppercase tracking-[0.18em] text-neutral-400 font-bold mb-1.5">
                Companions of the chronicle
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {unlockedHeroes.map((id) => {
                  const h = HEROES[id];
                  if (!h) return null;
                  return (
                    <div
                      key={id}
                      className="w-9 h-9 rounded-xl overflow-hidden border"
                      style={{ borderColor: h.accentColor, backgroundColor: h.color }}
                      title={`${h.name} — ${h.classType}`}
                    >
                      <ArtImage src={h.image} alt={h.name} fallbackText={h.classIcon} className="w-full h-full object-cover object-top" />
                    </div>
                  );
                })}
                {Array.from({ length: Math.max(0, Object.keys(HEROES).length - unlockedHeroes.length) }, (_, i) => (
                  <div
                    key={`locked-${i}`}
                    className="w-9 h-9 rounded-xl border border-white/10 bg-black/50 flex items-center justify-center text-neutral-600"
                    title="Still locked"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-7">
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="btn-3d featured-cta px-6 py-3 rounded-2xl text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" /> Keep Playing
              </button>
              {onEndlessTrial && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onEndlessTrial();
                  }}
                  className="btn-3d px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <InfinityIcon className="w-4 h-4" /> Enter Featured Endless Trial
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
