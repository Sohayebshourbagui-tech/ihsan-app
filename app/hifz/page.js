"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import HifzStatsCard from "../components/hifz/HifzStatsCard";
import StatusLegend   from "../components/hifz/StatusLegend";
import SurahSelector  from "../components/hifz/SurahSelector";
import SurahHeader    from "../components/hifz/SurahHeader";
import AyahGrid       from "../components/hifz/AyahGrid";
import RecitationModal from "../components/recitation/RecitationModal";
import { STATUS, TOTAL_AYAHS, SURAHS, loadProgress, saveProgress, loadAllStats } from "../../lib/storage";
import { getSurah } from "../../lib/quran";
import { recordRecitationResult } from "../../lib/hifzAnalytics";
import { T } from "../../lib/theme";
import { MicIcon, BookIcon } from "../components/icons";

export default function HifzPage() {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [progress,      setProgress]      = useState([]);
  const [stats,         setStats]         = useState({ memorized: 0, inProgress: 0 });
  const [mounted,       setMounted]       = useState(false);
  const [ayahTexts,     setAyahTexts]     = useState(null);
  const [reciteAyah,    setReciteAyah]    = useState(null);
  const [autoStartRecite, setAutoStartRecite] = useState(false);

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
    setAutoStartRecite(false);
    setReciteAyah({
      text,
      surahName:   selectedSurah.name,
      surahNumber: selectedSurah.n,
      ayahNumber:  idx + 1,
    });
  }

  function handleNextAyah() {
    if (!reciteAyah) return;
    const { surahNumber, ayahNumber } = reciteAyah;
    const surahInfo = SURAHS.find(s => s.n === surahNumber);
    if (!surahInfo || ayahNumber >= surahInfo.a) return;
    const nextN = ayahNumber + 1;
    const openNext = (texts) => {
      if (!texts?.[nextN - 1]) return;
      setAutoStartRecite(true);
      setReciteAyah({ text: texts[nextN - 1], surahName: surahInfo.name, surahNumber, ayahNumber: nextN });
    };
    if (selectedSurah?.n === surahNumber && ayahTexts) openNext(ayahTexts);
    else getSurah(surahNumber).then(openNext);
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

  function toggleAyah(idx) {
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
    <div style={{ minHeight: "100vh", background: T.bgPage, paddingBottom: 80 }}>

      {/* Header */}
      <header style={{
        background: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto",
          padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <Link href="/" style={{ textDecoration: "none", color: T.textSecondary, fontSize: 20, lineHeight: 1 }}>
            ←
          </Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>Hifz Tracker</div>
            <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>Quran memorisation</div>
          </div>
          <Link href="/recitation/continuous" style={{ marginLeft: "auto", textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: T.greenMuted, borderRadius: T.radiusFull,
              padding: "6px 14px",
            }}>
              <MicIcon color={T.green} size={14} strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>Recite</span>
            </div>
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 60 }}>

        {/* Stats */}
        <HifzStatsCard mounted={mounted} stats={stats} totalPct={totalPct} />

        {/* Status legend */}
        <StatusLegend />

        {/* Surah list */}
        <SurahSelector selectedSurah={selectedSurah} onSelect={selectSurah} mounted={mounted} />

        {/* Selected surah detail */}
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
            margin: "20px 20px 0",
            background: T.bgCard,
            borderRadius: T.radiusMd,
            border: `1px solid ${T.border}`,
            padding: "40px 20px",
            textAlign: "center",
            boxShadow: T.shadowSm,
          }}>
            <div style={{ marginBottom: 12 }}><BookIcon color={T.textTertiary} size={40} strokeWidth={1.4} /></div>
            <p style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, marginBottom: 6 }}>
              Select a surah to track
            </p>
            <p style={{ fontSize: 13, color: T.textTertiary, lineHeight: 1.6 }}>
              Tap any surah above to view and update your memorisation progress
            </p>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {reciteAyah && (
        <RecitationModal
          key={`${reciteAyah.surahNumber}-${reciteAyah.ayahNumber}`}
          ayah={reciteAyah.text}
          surahName={reciteAyah.surahName}
          surahNumber={reciteAyah.surahNumber}
          ayahNumber={reciteAyah.ayahNumber}
          onResult={handleRecitationResult}
          onClose={() => setReciteAyah(null)}
          onNextAyah={handleNextAyah}
          hasNextAyah={(() => {
            const info = SURAHS.find(s => s.n === reciteAyah.surahNumber);
            return !!info && reciteAyah.ayahNumber < info.a;
          })()}
          autoStart={autoStartRecite}
        />
      )}

      <BottomNav />
    </div>
  );
}
