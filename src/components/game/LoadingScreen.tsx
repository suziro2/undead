"use client";

import React, { useEffect, useState } from "react";
import { HEROES } from "@/lib/gameData";
import ArtImage from "@/components/game/ArtImage";

const featuredHeroes = [HEROES.aiden, HEROES.luna, HEROES.riven];
const loadingTips = [
  "Tip: Upgrade your attack to defeat tougher undead.",
  "Tip: Save health potions for elite enemies and bosses.",
  "Tip: Each hero has a unique skill and combat role.",
  "Tip: Clear each stage to unlock the next challenge.",
];

interface LoadingScreenProps {
  progress?: number;
  error?: string | null;
  onRetry?: () => void;
}

export default function LoadingScreen({ progress = 0, error = null, onRetry }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTipIndex((i) => (i + 1) % loadingTips.length), 3600);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <main className="realm-loader" role="status" aria-live="polite" aria-label="Loading Undead Slayer">
      <div className="realm-loader__stars" aria-hidden="true">
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} style={{
            left: `${(i * 37 + 7) % 100}%`,
            top: `${(i * 23 + 11) % 76}%`,
            animationDelay: `${(i % 7) * -0.43}s`,
            animationDuration: `${2.4 + (i % 5) * 0.55}s`,
          }} />
        ))}
      </div>
      <div className="realm-loader__moon" aria-hidden="true" />
      <div className="realm-loader__mountains realm-loader__mountains--far" aria-hidden="true" />
      <div className="realm-loader__mountains realm-loader__mountains--near" aria-hidden="true" />
      <div className="realm-loader__castle" aria-hidden="true">
        <span className="realm-loader__tower realm-loader__tower--left" />
        <span className="realm-loader__tower realm-loader__tower--center" />
        <span className="realm-loader__tower realm-loader__tower--right" />
        <span className="realm-loader__gate" />
      </div>
      <div className="realm-loader__ground" aria-hidden="true" />

      <section className="realm-loader__content">
        <div className="realm-loader__crest" aria-hidden="true">
          <span>⚔</span>
          <i />
        </div>
        <p className="realm-loader__eyebrow">A realm swallowed by darkness</p>
        <h1>UNDEAD <span>SLAYER</span></h1>
        <p className="realm-loader__subtitle">CHRONICLES</p>
        <div className="realm-loader__rule"><span>✦</span></div>
        <div className="realm-loader__heroes" aria-label="Preparing your heroes">
          {featuredHeroes.map((hero, index) => (
            <div
              key={hero.id}
              className={`realm-loader__hero realm-loader__hero--${index + 1}`}
              style={{ borderColor: `${hero.accentColor}88`, boxShadow: `0 0 30px ${hero.color}22` }}
            >
              <ArtImage src={hero.image} alt={hero.name} fallbackText={hero.classIcon} />
            </div>
          ))}
        </div>
        <p className="realm-loader__status"><span className="realm-loader__pulse" /> {error ? "Some assets need attention" : "Preparing your adventure"}</p>
        <div className="realm-loader__progress" role="progressbar" aria-label="Loading game assets" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, progress))}>
          <span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
        <p className="realm-loader__percentage">{Math.max(0, Math.min(100, progress))}%</p>
        <p className="realm-loader__tip" aria-live="polite">{loadingTips[tipIndex]}</p>
        {error && (
          <div className="realm-loader__error" role="alert">
            <p>{error}</p>
            <div className="realm-loader__error-actions">
              {onRetry && <button type="button" onClick={onRetry}>RETRY LOADING</button>}
              <button type="button" onClick={() => window.location.reload()}>RELOAD GAME</button>
            </div>
          </div>
        )}
        <div className="realm-loader__footer">
          <span>10 HERO CLASSES</span><i>◆</i><span>25 STAGES</span><i>◆</i><span>5 CHAPTERS</span>
        </div>
      </section>
      <span className="realm-loader__version">PREPARE FOR THE HUNT</span>
    </main>
  );
}
