"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import HifzStatsCard from "../components/hifz/HifzStatsCard";
import StatusLegend   from "../components/hifz/StatusLegend";
import SurahSelector  from "../components/hifz/SurahSelector";
import SurahHeader    from "../components/hifz/SurahHeader";
import AyahGrid        from "../components/hifz/AyahGrid";
import RecitationModal from "../components/recitation/RecitationModal";
import { STATUS, TOTAL_AYAHS, SURAHS, loadProgress, saveProgress, loadAllStats } from "../../lib/storage";
import { getSurah } from "../../lib/quran";
import { recordRecitationResult } from "../../lib/hifzAnalytics";
import ReviewCard from "../components/hifz/ReviewCard";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity, pointerEvents:"none" }}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8"/>
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5"/>
          <circle cx="30" cy="30" r="2"   fill="white"/>
          <circle cx="0"  cy="0"  r="1.5" fill="white"/>
          <circle cx="60" cy="0"  r="1.5" fill="white"/>
          <circle cx="0"  cy="60" r="1.5" fill="white"/>
          <circle cx="60" cy="60" r="1.5" fill="white"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

export default function HifzPage() {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [progress,      setProgress]      = useState([]);
  const [stats,         setStats]         = useState({ memorized: 0, inProgress: 0 });
  const [mounted,       setMounted]       = useState(false);
  const [ayahTexts,     setAyahTexts]     = useState(null);
  const [reciteAyah,    setReciteAyah]    = useState(null);

  useEffect(() => {
    setMounted(true);
    setStats(loadAllStats());
  }, []);

  const selectSurah = useCallback((surah) => {
    setSelectedSurah(surah);
    setProgress(loadProgress(surah));
    setAyahTexts(null);
    getSurah(surah.n).then(texts => setAyahTexts(texts));
  }, []);

  function openRecitation(idx, text) {
    if (!text) return;
    setReciteAyah({
      text,
      surahName:   selectedSurah.name,
      surahNumber: selectedSurah.n,
      ayahNumber:  idx + 1,
    });
  }

  function openRecitationFromReview(surahN, ayahN) {
    getSurah(surahN).then(texts => {
      if (!texts?.[ayahN - 1]) return;
      const surahData = SURAHS.find(s => s.n === surahN);
      setReciteAyah({
        text:        texts[ayahN - 1],
        surahName:   surahData?.name ?? `Surah ${surahN}`,
        surahNumber: surahN,
        ayahNumber:  ayahN,
      });
    });
  }

  function handleRecitationResult({ surah: surahN, ayah: ayahN, score, passed }) {
    recordRecitationResult({ surah: surahN, ayah: ayahN, score, passed });

    if (passed) {
      const surahData = SURAHS.find(s => s.n === surahN);
      if (surahData) {
        const prog = loadProgress(surahData);
        if (prog[ayahN - 1] !== STATUS.MEMORIZED) {
          prog[ayahN - 1] = STATUS.MEMORIZED;
          saveProgress(surahN, prog);
          setStats(loadAllStats());
          if (selectedSurah?.n === surahN) setProgress([...prog]);
        }
      }
    }
  }

  function toggleAyah(idx, text) {
    setProgress(prev => {
      const next = [...prev];
      next[idx] = (next[idx] + 1) % 3;
      saveProgress(selectedSurah.n, next);
      setStats(loadAllStats());
      return next;
    });
  }

  function markAll(status) {
    if (!selectedSurah) return;
    const next = new Array(selectedSurah.a).fill(status);
    setProgress(next);
    saveProgress(selectedSurah.n, next);
    setStats(loadAllStats());
  }

  const totalPct = Math.round((stats.memorized / TOTAL_AYAHS) * 100);

  return (
    <>
      <style>{`::-webkit-scrollbar{display:none}`}</style>
      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>

        {/* Navbar */}
        <nav style={{
          background: `linear-gradient(135deg,#157a3c 0%,${G} 55%,${G2} 100%)`,
          width: "100%", boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
          position: "relative", overflow: "hidden",
        }}>
          <GeoPattern id="hifzNav" opacity={0.13}/>
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "13px 20px 15px",
            display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1,
          }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, cursor: "pointer",
              }}>←</div>
            </Link>
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Hifz Tracker</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 }}>Quran memorisation progress</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 22 }}>📖</div>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 60 }}>
          <HifzStatsCard mounted={mounted} stats={stats} totalPct={totalPct} />
          <StatusLegend />
          <ReviewCard mounted={mounted} onReciteAyah={openRecitationFromReview} />
          <SurahSelector selectedSurah={selectedSurah} onSelect={selectSurah} mounted={mounted} />

          {selectedSurah && (
            <>
              <SurahHeader
                surah={selectedSurah}
                progress={progress}
                onMarkAll={() => markAll(STATUS.MEMORIZED)}
                onReset={() => markAll(STATUS.NONE)}
              />
              <AyahGrid
                progress={progress}
                onToggle={toggleAyah}
                ayahTexts={ayahTexts}
                onRecite={openRecitation}
              />
            </>
          )}

          {!selectedSurah && (
            <div style={{
              background: "#fff", margin: "12px 16px 0", borderRadius: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", padding: "36px 20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>📖</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                Select a surah to start tracking
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                Tap any surah above to view and update your memorisation progress
              </p>
            </div>
          )}

          <div style={{ height: 20 }}/>
        </div>
      </div>
      {reciteAyah && (
        <RecitationModal
          ayah={reciteAyah.text}
          surahName={reciteAyah.surahName}
          surahNumber={reciteAyah.surahNumber}
          ayahNumber={reciteAyah.ayahNumber}
          onResult={handleRecitationResult}
          onClose={() => setReciteAyah(null)}
        />
      )}
      <BottomNav />
    </>
  );
}
