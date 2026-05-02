"use client";

import { useState, useRef, useEffect } from "react";
import BottomNav from "../components/BottomNav";

// ─── Data ──────────────────────────────────────────────────────────────────
const AYAHS = [
  {
    surah: "Al-Fatiha",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Most Gracious, the Most Merciful",
    ref: "Al-Fatiha · Ayah 1",
    number: "1",
  },
  {
    surah: "Al-Ikhlas",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say: He is Allah, the One",
    ref: "Al-Ikhlas · Ayah 1",
    number: "112",
  },
  {
    surah: "Al-Falaq",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    translation: "Say: I seek refuge in the Lord of the daybreak",
    ref: "Al-Falaq · Ayah 1",
    number: "113",
  },
  {
    surah: "An-Nas",
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    translation: "Say: I seek refuge in the Lord of mankind",
    ref: "An-Nas · Ayah 1",
    number: "114",
  },
  {
    surah: "Al-Kawthar",
    arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    translation: "Indeed, We have granted you Al-Kawthar",
    ref: "Al-Kawthar · Ayah 1",
    number: "108",
  },
];

const MOCK_FEEDBACKS = [
  {
    score: 92,
    label: "Excellent",
    color: "#1a8a4a",
    bg: "#d1fae5",
    metrics: { pronunciation: 95, tajweed: 88, rhythm: 78 },
    notes: [
      { type: "good", text: "Makharij (articulation points) are accurate.", detail: "The ب and م sounds are well-distinguished." },
      { type: "good", text: "Ghunnah applied correctly on noon mushaddad.", detail: "The nasalization is clear and held for the right duration." },
      { type: "warn", text: "Madd al-asli slightly short on الرَّحْمَٰنِ.", detail: "Try to hold the alif for a full 2 counts." },
      { type: "warn", text: "Waqf (pause) timing between ayahs could be more consistent.", detail: "A brief breath between verses improves rhythm." },
    ],
  },
  {
    score: 78,
    label: "Good",
    color: "#b45309",
    bg: "#fef9c3",
    metrics: { pronunciation: 82, tajweed: 74, rhythm: 80 },
    notes: [
      { type: "good", text: "Overall pronunciation is clear and understandable.", detail: "The heavy letters (ص، ض، ط) are articulated well." },
      { type: "warn", text: "Idgham rule not applied after tanwin.", detail: "When noon sakinah is followed by و or ي, merge the sounds." },
      { type: "warn", text: "Qalqalah letters need more bounce.", detail: "Letters ق، ط، ب، ج، د should have a slight echo when sukoon." },
      { type: "warn", text: "Reading pace is slightly fast.", detail: "Slow down to allow proper elongation of madd letters." },
    ],
  },
  {
    score: 85,
    label: "Very Good",
    color: "#1a8a4a",
    bg: "#d1fae5",
    metrics: { pronunciation: 90, tajweed: 82, rhythm: 76 },
    notes: [
      { type: "good", text: "Strong command of heavy and light letter differentiation.", detail: "The distinction between ه and ح is very clear." },
      { type: "good", text: "Ikhfa applied correctly in most positions.", detail: "The nasal sound when noon sakinah meets certain letters is accurate." },
      { type: "warn", text: "Terminal vowel sounds (harakat) occasionally dropped.", detail: "Maintain fathah, kasrah, and dhammah through to the end of words." },
    ],
  },
];

// ─── Metric Bar ────────────────────────────────────────────────────────────
function MetricBar({ label, value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#4a5568" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 6,
          background: color,
          width: width + "%",
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

// ─── Waveform ──────────────────────────────────────────────────────────────
function Waveform({ isRecording }) {
  const bars = Array.from({ length: 40 });
  const [heights, setHeights] = useState(bars.map(() => 8));

  useEffect(() => {
    if (!isRecording) {
      setHeights(bars.map(() => 8));
      return;
    }
    const interval = setInterval(() => {
      setHeights(bars.map(() => 8 + Math.random() * 44));
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 60, width: "100%" }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 3,
            height: h,
            background: isRecording ? "#1a8a4a" : "#e2e8f0",
            transition: isRecording ? "height 0.08s ease" : "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function RecitationPage() {
  const [selectedSurah, setSelectedSurah] = useState(0);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [mockIdx, setMockIdx] = useState(0);
  const timerRef = useRef(null);

  const ayah = AYAHS[selectedSurah];

  const startRecording = () => {
    setRecording(true);
    setFeedback(null);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setAnalyzing(true);
    setTimeout(() => {
      setFeedback(MOCK_FEEDBACKS[mockIdx % MOCK_FEEDBACKS.length]);
      setMockIdx(i => i + 1);
      setAnalyzing(false);
    }, 1600);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const metricColor = (v) => v >= 85 ? "#1a8a4a" : v >= 70 ? "#b45309" : "#e53e3e";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "inherit", paddingBottom: 70 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "#fff",
        borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg,#1a8a4a,#0d6035)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(26,138,74,0.25)",
          }}>🎙</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1a202c", lineHeight: 1.2 }}>Recitation</div>
            <div style={{ fontSize: 12, color: "#718096" }}>AI-powered tajweed feedback</div>
          </div>
        </div>
        <div style={{
          fontSize: 11, color: "#718096", background: "#f0f0f0",
          padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0",
        }}>Beta</div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Surah selector */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
            Select Surah
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {AYAHS.map((a, i) => (
              <button
                key={i}
                onClick={() => { setSelectedSurah(i); setFeedback(null); }}
                style={{
                  padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                  border: selectedSurah === i ? "none" : "1px solid #e2e8f0",
                  background: selectedSurah === i ? "#1a8a4a" : "#fff",
                  color: selectedSurah === i ? "#fff" : "#4a5568",
                  fontWeight: selectedSurah === i ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {a.surah}
              </button>
            ))}
          </div>
        </div>

        {/* Ayah display */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
          padding: "24px 20px", textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            fontFamily: "serif", fontSize: 28, color: "#1a202c",
            direction: "rtl", lineHeight: 2, marginBottom: 14,
          }}>
            {ayah.arabic}
          </div>
          <div style={{ fontSize: 14, color: "#718096", fontStyle: "italic", lineHeight: 1.7, marginBottom: 8 }}>
            "{ayah.translation}"
          </div>
          <div style={{ fontSize: 12, color: "#1a8a4a", fontWeight: 600 }}>{ayah.ref}</div>
        </div>

        {/* Recorder */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
          padding: "24px 20px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <Waveform isRecording={recording} />

          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={analyzing}
            style={{
              width: 68, height: 68, borderRadius: "50%", border: "none",
              background: recording ? "#e53e3e" : "#1a8a4a",
              color: "#fff", fontSize: 28, cursor: analyzing ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: recording
                ? "0 0 0 8px rgba(229,62,62,0.15), 0 4px 16px rgba(229,62,62,0.3)"
                : "0 4px 16px rgba(26,138,74,0.3)",
              transition: "all 0.2s",
              animation: recording ? "pulse 1.5s infinite" : "none",
            }}
          >
            {analyzing ? "⏳" : recording ? "⏹" : "🎙"}
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: recording ? "#e53e3e" : "#718096", fontWeight: recording ? 600 : 400 }}>
              {analyzing ? "Analyzing your recitation..." : recording ? "Recording... tap to stop" : "Tap to start recording"}
            </div>
            {recording && (
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a202c", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(seconds)}
              </div>
            )}
          </div>
        </div>

        {/* Feedback panel */}
        {feedback && (
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
            padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            animation: "slideIn 0.35s ease",
          }}>
            <style>{`
              @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
              @keyframes pulse { 0%,100%{box-shadow:0 0 0 8px rgba(229,62,62,0.15)} 50%{box-shadow:0 0 0 16px rgba(229,62,62,0)} }
            `}</style>

            {/* Score header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a202c" }}>Recitation Feedback</div>
              <div style={{
                fontSize: 14, fontWeight: 700, padding: "6px 16px", borderRadius: 20,
                background: feedback.bg, color: feedback.color,
              }}>
                {feedback.label} · {feedback.score}%
              </div>
            </div>

            {/* Metric bars */}
            <div style={{ marginBottom: 20 }}>
              <MetricBar label="Pronunciation" value={feedback.metrics.pronunciation} color={metricColor(feedback.metrics.pronunciation)} />
              <MetricBar label="Tajweed Rules" value={feedback.metrics.tajweed} color={metricColor(feedback.metrics.tajweed)} />
              <MetricBar label="Rhythm & Flow" value={feedback.metrics.rhythm} color={metricColor(feedback.metrics.rhythm)} />
            </div>

            {/* Notes */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#718096", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              Detailed Notes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {feedback.notes.map((note, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, marginTop: 1,
                    background: note.type === "good" ? "#d1fae5" : "#fef9c3",
                    color: note.type === "good" ? "#065f46" : "#713f12",
                  }}>
                    {note.type === "good" ? "✓" : "!"}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <span style={{ color: "#1a202c" }}>{note.text}</span>
                    {" "}
                    <span style={{ color: "#718096" }}>{note.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Try again */}
            <button
              onClick={() => { setFeedback(null); }}
              style={{
                width: "100%", marginTop: 18, padding: "11px",
                background: "#fff", border: "1px solid #1a8a4a",
                color: "#1a8a4a", borderRadius: 10, fontSize: 14,
                cursor: "pointer", fontWeight: 600, transition: "background 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
