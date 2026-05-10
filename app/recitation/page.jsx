"use client";

import { useState, useRef, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import { T } from "../../lib/theme";

const AYAHS = [
  { surah: "Al-Fatiha",   arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",  translation: "In the name of Allah, the Most Gracious, the Most Merciful",    ref: "1:1"   },
  { surah: "Al-Ikhlas",   arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",                  translation: "Say: He is Allah, the One",                                     ref: "112:1" },
  { surah: "Al-Falaq",    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",            translation: "Say: I seek refuge in the Lord of the daybreak",                 ref: "113:1" },
  { surah: "An-Nas",      arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",              translation: "Say: I seek refuge in the Lord of mankind",                      ref: "114:1" },
  { surah: "Al-Kawthar",  arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",           translation: "Indeed, We have granted you Al-Kawthar",                         ref: "108:1" },
];

const MOCK_FEEDBACKS = [
  {
    score: 92, label: "Excellent",
    metrics: { pronunciation: 95, tajweed: 88, rhythm: 78 },
    notes: [
      { type: "good", text: "Makharij (articulation points) are accurate. The ب and م sounds are well-distinguished." },
      { type: "good", text: "Ghunnah applied correctly on noon mushaddad." },
      { type: "warn", text: "Madd al-asli slightly short on الرَّحْمَٰنِ. Try to hold the alif for a full 2 counts." },
      { type: "warn", text: "Waqf (pause) timing between ayahs could be more consistent." },
    ],
  },
  {
    score: 78, label: "Good",
    metrics: { pronunciation: 82, tajweed: 74, rhythm: 80 },
    notes: [
      { type: "good", text: "Overall pronunciation is clear and understandable." },
      { type: "warn", text: "Idgham rule not applied after tanwin. When noon sakinah meets و or ي, merge the sounds." },
      { type: "warn", text: "Qalqalah letters need more bounce on ق، ط، ب، ج، د." },
      { type: "warn", text: "Reading pace is slightly fast — slow down for proper elongation." },
    ],
  },
  {
    score: 85, label: "Very Good",
    metrics: { pronunciation: 90, tajweed: 82, rhythm: 76 },
    notes: [
      { type: "good", text: "Strong command of heavy and light letter differentiation." },
      { type: "good", text: "Ikhfa applied correctly in most positions." },
      { type: "warn", text: "Terminal vowel sounds occasionally dropped — maintain harakat through to word endings." },
    ],
  },
];

function Waveform({ isRecording }) {
  const bars = Array.from({ length: 36 });
  const [heights, setHeights] = useState(bars.map(() => 6));

  useEffect(() => {
    if (!isRecording) { setHeights(bars.map(() => 6)); return; }
    const interval = setInterval(() => {
      setHeights(bars.map(() => 6 + Math.random() * 52));
    }, 90);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 64, width: "100%" }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 3, height: h,
          background: isRecording ? T.green : T.border,
          transition: isRecording ? "height 0.09s ease" : "all 0.4s ease",
        }} />
      ))}
    </div>
  );
}

function scoreColor(v) {
  return v >= 85 ? T.green : v >= 70 ? T.amber : T.red;
}

export default function RecitationPage() {
  const [selectedSurah, setSelectedSurah] = useState(0);
  const [recording, setRecording]         = useState(false);
  const [analyzing, setAnalyzing]         = useState(false);
  const [feedback, setFeedback]           = useState(null);
  const [seconds, setSeconds]             = useState(0);
  const [mockIdx, setMockIdx]             = useState(0);
  const timerRef = useRef(null);

  const ayah = AYAHS[selectedSurah];

  function startRecording() {
    setRecording(true); setFeedback(null); setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }

  function stopRecording() {
    setRecording(false);
    clearInterval(timerRef.current);
    setAnalyzing(true);
    setTimeout(() => {
      setFeedback(MOCK_FEEDBACKS[mockIdx % MOCK_FEEDBACKS.length]);
      setMockIdx(i => i + 1);
      setAnalyzing(false);
    }, 1600);
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

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
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>Recitation</div>
            <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 1 }}>Tajweed feedback</div>
          </div>
          <span style={{
            fontSize: 11, color: T.textTertiary,
            background: T.bgSubtle, padding: "3px 10px",
            borderRadius: T.radiusFull, fontWeight: 600,
          }}>Beta</span>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 8px" }}>

        {/* Surah selector — slim tab row */}
        <div style={{ padding: "16px 20px 0", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {AYAHS.map((a, i) => (
            <button
              key={i}
              onClick={() => { setSelectedSurah(i); setFeedback(null); }}
              style={{
                padding: "7px 14px",
                borderRadius: T.radiusFull,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                border: "none",
                background: selectedSurah === i ? T.green : T.bgSubtle,
                color: selectedSurah === i ? T.textInverse : T.textSecondary,
                fontWeight: selectedSurah === i ? 600 : 400,
                fontFamily: "inherit",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {a.surah}
            </button>
          ))}
        </div>

        {/* Ayah display — immersive centered text */}
        <div style={{ padding: "32px 28px 24px", textAlign: "center" }}>
          <p style={{
            fontFamily: T.fontArabic,
            fontSize: 34,
            direction: "rtl",
            lineHeight: 2.4,
            color: T.textPrimary,
            margin: "0 0 16px",
          }}>
            {ayah.arabic}
          </p>
          <p style={{
            fontSize: 15,
            color: T.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.7,
            margin: "0 0 10px",
          }}>
            "{ayah.translation}"
          </p>
          <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{ayah.ref}</span>
        </div>

        {/* Recorder */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 20,
          padding: "8px 20px 24px",
        }}>
          <Waveform isRecording={recording} />

          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={analyzing}
            style={{
              width: 80, height: 80, borderRadius: "50%", border: "none",
              background: recording
                ? `linear-gradient(135deg, ${T.red}, #e74c3c)`
                : `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
              color: T.textInverse, cursor: analyzing ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: recording
                ? `0 0 0 10px rgba(192,57,43,0.12), 0 4px 20px rgba(192,57,43,0.3)`
                : `0 4px 20px rgba(26,138,74,0.28)`,
              transition: "box-shadow 0.2s, background 0.2s",
              fontSize: 26,
            }}
          >
            {analyzing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  strokeLinecap="round" className="animate-spin" style={{ transformOrigin: "center" }} />
              </svg>
            ) : recording ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: recording ? T.red : T.textTertiary, fontWeight: recording ? 600 : 400 }}>
              {analyzing ? "Analysing your recitation…" : recording ? "Recording · tap to stop" : "Tap to start recording"}
            </div>
            {recording && (
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(seconds)}
              </div>
            )}
          </div>
        </div>

        {/* Feedback panel */}
        {feedback && (
          <div className="animate-fadeUp" style={{ margin: "0 20px 8px" }}>
            <div style={{
              background: T.bgCard,
              borderRadius: T.radiusMd,
              border: `1px solid ${T.border}`,
              padding: "24px",
              boxShadow: T.shadowSm,
            }}>
              {/* Score */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  fontSize: 56, fontWeight: 900, lineHeight: 1,
                  color: scoreColor(feedback.score),
                  letterSpacing: "-2px",
                }}>
                  {feedback.score}
                </div>
                <div style={{ fontSize: 14, color: T.textSecondary, marginTop: 6 }}>
                  {feedback.label}
                </div>
              </div>

              {/* Metric bars */}
              <div style={{ marginBottom: 24 }}>
                {[
                  { label: "Pronunciation", value: feedback.metrics.pronunciation },
                  { label: "Tajweed",       value: feedback.metrics.tajweed       },
                  { label: "Rhythm & Flow", value: feedback.metrics.rhythm        },
                ].map(({ label, value }) => (
                  <MetricRow key={label} label={label} value={value} />
                ))}
              </div>

              {/* Notes */}
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Notes
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {feedback.notes.map((note, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, marginTop: 1,
                      background: note.type === "good" ? T.greenMuted : T.amberBg,
                      color: note.type === "good" ? T.green : T.amber,
                      fontWeight: 700,
                    }}>
                      {note.type === "good" ? "✓" : "!"}
                    </span>
                    <span style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{note.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setFeedback(null)}
                style={{
                  width: "100%", padding: "12px",
                  background: "transparent", border: "none",
                  color: T.green, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function MetricRow({ label, value }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  const color = value >= 85 ? T.green : value >= 70 ? T.amber : T.red;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.textSecondary }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 5, background: T.bgSubtle, borderRadius: T.radiusFull, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: T.radiusFull,
          background: color,
          width: width + "%",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}
