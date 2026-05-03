"use client";

import { useEffect, useState } from "react";
import { getReviewQueue, getWeakAyahs } from "../../../lib/hifzAnalytics";
import { SURAHS } from "../../../lib/storage";

const G           = "#1a8a4a";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

function surahName(n) {
  return SURAHS.find(s => s.n === n)?.name ?? `Surah ${n}`;
}

function ScoreChip({ score }) {
  const weak   = score < 70;
  const medium = score >= 70 && score < 90;
  const bg     = weak ? "#fef2f2" : medium ? "#fefce8" : "#f0fdf4";
  const color  = weak ? "#dc2626" : medium ? "#b45309" : "#15803d";
  const border = weak ? "#fca5a5" : medium ? "#fde68a" : "#86efac";
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      {score}%
    </span>
  );
}

export default function ReviewCard({ mounted, onReciteAyah }) {
  const [queue, setQueue] = useState([]);
  const [weak,  setWeak]  = useState([]);

  useEffect(() => {
    if (!mounted) return;
    setQueue(getReviewQueue(5));
    setWeak(getWeakAyahs(5));
  }, [mounted]);

  if (!mounted || (queue.length === 0 && weak.length === 0)) return null;

  // Deduplicate: items in the review queue are also often weak
  const queueKeys = new Set(queue.map(r => `${r.surah}:${r.ayah}`));
  const weakOnly  = weak.filter(r => !queueKeys.has(`${r.surah}:${r.ayah}`));

  return (
    <div style={{
      background: "#fff", margin: "12px 16px 0", borderRadius: 16,
      boxShadow: CARD_SHADOW, padding: "16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>📋</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>Today's Review</span>
        {queue.length > 0 && (
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 800, padding: "3px 9px",
            borderRadius: 99, background: "#dc2626", color: "#fff",
          }}>
            {queue.length} due
          </span>
        )}
      </div>

      {/* Due now */}
      {queue.length > 0 && (
        <>
          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: "#dc2626",
                      letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Due Now
          </p>
          {queue.map(r => (
            <AyahRow
              key={`${r.surah}:${r.ayah}`}
              name={surahName(r.surah)}
              ayah={r.ayah}
              lastScore={r.lastScore}
              onRecite={() => onReciteAyah(r.surah, r.ayah)}
              urgent
            />
          ))}
        </>
      )}

      {/* Weak but not due today */}
      {weakOnly.length > 0 && (
        <>
          <p style={{ margin: `${queue.length > 0 ? "10px" : "0px"} 0 6px`,
                      fontSize: 10, fontWeight: 800, color: "#b45309",
                      letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Needs Practice
          </p>
          {weakOnly.map(r => (
            <AyahRow
              key={`${r.surah}:${r.ayah}`}
              name={surahName(r.surah)}
              ayah={r.ayah}
              lastScore={r.lastScore}
              onRecite={() => onReciteAyah(r.surah, r.ayah)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function AyahRow({ name, ayah, lastScore, onRecite, urgent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 0",
      borderBottom: "1px solid #f3f4f6",
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{name}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}> · Ayah {ayah}</span>
      </div>
      <ScoreChip score={lastScore} />
      <button
        onClick={onRecite}
        style={{
          padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
          border: `1.5px solid ${urgent ? "#dc2626" : G}`,
          background: urgent ? "#fef2f2" : "#ecfdf3",
          color: urgent ? "#dc2626" : G,
          cursor: "pointer", flexShrink: 0,
        }}
      >
        Recite
      </button>
    </div>
  );
}
